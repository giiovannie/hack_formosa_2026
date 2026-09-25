"""CSV/manual ETL: extract, validate, normalize and stage records for loading."""

import csv
import datetime as dt
import io
import json
import sys
import time
import unicodedata

import pandas as pd


def clean(value):
    if value is None:
        return ""
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=True, sort_keys=True)
    text = unicodedata.normalize("NFC", str(value)).strip()
    if any(0xD800 <= ord(char) <= 0xDFFF for char in text):
        raise ValueError("El archivo contiene caracteres que no son UTF-8 válidos. Guardalo nuevamente como CSV UTF-8.")
    return text


def detect_delimiter(raw):
    sample = raw[:8192]
    try:
        return csv.Sniffer().sniff(sample, delimiters=",;\t|").delimiter
    except csv.Error:
        return ","


def infer_column_type(values):
    populated = [value for value in values if value]
    if not populated:
        return "empty"
    numeric = pd.to_numeric(pd.Series(populated), errors="coerce")
    if numeric.notna().all():
        return "integer" if (numeric % 1 == 0).all() else "number"
    try:
        for value in populated:
            dt.date.fromisoformat(value)
        return "date"
    except ValueError:
        return "text"


def profile_columns(frame):
    profiles = []
    for column in frame.columns:
        values = [clean(value) for value in frame[column].tolist()]
        profiles.append({
            "name": clean(column),
            "rows": len(values),
            "missingValues": sum(value == "" for value in values),
            "distinctValues": len(set(value for value in values if value)),
            "detectedType": infer_column_type(values),
        })
    return profiles


def process(payload):
    started = time.perf_counter()
    kind = payload["kind"]
    raw = payload["rawPayload"]
    if not isinstance(raw, str) or not raw.strip():
        raise ValueError("No hay datos para procesar")

    extraction_start = time.perf_counter()
    delimiter = None
    if kind == "file":
        # A UTF-8 BOM is a file marker, not part of the first column name.
        raw = raw.removeprefix("\ufeff")
        delimiter = detect_delimiter(raw)
        csv_rows = list(csv.reader(io.StringIO(raw, newline=""), delimiter=delimiter))
        if not csv_rows:
            raise ValueError("El archivo CSV no contiene encabezados")
        header = csv_rows[0]
        names = [clean(name) for name in header]
        normalized_names = [name.casefold() for name in names]
        if not names or any(not name for name in names) or len(normalized_names) != len(set(normalized_names)):
            raise ValueError("Encabezados CSV vacíos o duplicados")
        for row_number, row in enumerate(csv_rows[1:], start=2):
            if not row:
                continue
            if len(row) != len(header):
                raise ValueError(f"La fila {row_number} tiene {len(row)} columnas; se esperaban {len(header)}")
        try:
            frame = pd.read_csv(io.StringIO(raw), sep=delimiter, dtype=str,
                                keep_default_na=False, skip_blank_lines=True, on_bad_lines="error")
        except (pd.errors.ParserError, pd.errors.EmptyDataError) as error:
            raise ValueError(f"No se pudo leer la estructura del CSV: {error}") from error
        if len(frame.columns) != len(header):
            raise ValueError("No se pudieron identificar todas las columnas del CSV")
        if frame.empty:
            raise ValueError("El archivo CSV no contiene filas de datos")
        records = frame.to_dict(orient="records")
    elif kind == "manual":
        record = json.loads(raw)
        if not isinstance(record, dict) or not record:
            raise ValueError("Registro JSON inválido")
        frame = pd.DataFrame([record])
        records = [record]
    else:
        raise ValueError("Tipo de importación inválido")
    extraction_ms = round((time.perf_counter() - extraction_start) * 1000, 3)

    transform_start = time.perf_counter()
    accepted = []
    rejected = []
    seen = set()
    trimmed_values = 0
    for index, original in enumerate(records, 1):
        if not isinstance(original, dict):
            rejected.append({"row": index, "reason": "invalid", "original": original})
            continue
        normalized = {}
        for key, value in original.items():
            cleaned_key = clean(key)
            cleaned_value = clean(value)
            if cleaned_key != str(key) or cleaned_value != str(value):
                trimmed_values += 1
            normalized[cleaned_key] = cleaned_value
        if not normalized or any(not key for key in normalized):
            rejected.append({"row": index, "reason": "invalid", "original": original})
            continue
        if all(not value for value in normalized.values()):
            rejected.append({"row": index, "reason": "empty", "original": original})
            continue
        fingerprint = json.dumps(normalized, ensure_ascii=True, sort_keys=True)
        if fingerprint in seen:
            rejected.append({"row": index, "reason": "duplicate", "original": original})
            continue
        seen.add(fingerprint)
        accepted.append({"row": index, "original": original, "normalized": normalized})
    transform_ms = round((time.perf_counter() - transform_start) * 1000, 3)
    profile = profile_columns(frame)
    summary = {"total": len(records), "accepted": len(accepted), "rejected": len(rejected)}
    total_ms = round((time.perf_counter() - started) * 1000, 3)

    return {
        "summary": summary,
        "accepted": accepted,
        "rejected": rejected,
        "columnProfiles": profile,
        "stages": [
            {"name": "extraction", "status": "completed", "rows": len(records),
             "columns": len(frame.columns), "delimiter": delimiter, "durationMs": extraction_ms},
            {"name": "validation", "status": "completed", "checkedRows": len(records),
             "checkedColumns": len(frame.columns)},
            {"name": "cleaning", "status": "completed", "normalizedValues": trimmed_values},
            {"name": "sanitization", "status": "completed", "invalidCharacters": 0},
            {"name": "normalization", "status": "completed", "profiledColumns": len(profile)},
            {"name": "classification", "status": "completed", "accepted": len(accepted), "rejected": len(rejected),
             "duplicates": sum(item["reason"] == "duplicate" for item in rejected),
             "emptyRows": sum(item["reason"] == "empty" for item in rejected)},
            {"name": "loading", "status": "pending", "target": "ProcessedRecords",
             "stagedIn": "ProcessingRuns.result"},
            {"name": "total", "status": "completed", "durationMs": total_ms,
             "transformDurationMs": transform_ms},
        ],
    }


def main():
    # Node sends UTF-8 JSON over stdin; Windows console defaults may be legacy encodings.
    if hasattr(sys.stdin, "reconfigure"):
        sys.stdin.reconfigure(encoding="utf-8", errors="strict")
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")
    try:
        result = process(json.load(sys.stdin))
        json.dump({"ok": True, "result": result}, sys.stdout, ensure_ascii=True, allow_nan=False)
    except (ValueError, KeyError, UnicodeError, pd.errors.ParserError, pd.errors.EmptyDataError) as error:
        json.dump({"ok": False, "error": str(error)[:200]}, sys.stdout, ensure_ascii=True)


if __name__ == "__main__":
    main()
