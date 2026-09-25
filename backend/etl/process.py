"""Generic, tenant-neutral CSV/JSON normalization for BE E05."""

import io
import json
import sys
import unicodedata
import csv

import pandas as pd


def clean(value):
    if value is None:
        return ""
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False, sort_keys=True)
    return unicodedata.normalize("NFC", str(value)).strip()


def process(payload):
    kind = payload["kind"]
    raw = payload["rawPayload"]
    if kind == "file":
        header = next(csv.reader(io.StringIO(raw)), [])
        names = [clean(name) for name in header]
        if not names or any(not name for name in names) or len(names) != len(set(names)):
            raise ValueError("Encabezados CSV vacíos o duplicados")
        frame = pd.read_csv(io.StringIO(raw), dtype=str, keep_default_na=False)
        records = frame.to_dict(orient="records")
    elif kind == "manual":
        record = json.loads(raw)
        if not isinstance(record, dict):
            raise ValueError("Registro JSON inválido")
        records = [record]
    else:
        raise ValueError("Tipo de importación inválido")

    accepted = []
    rejected = []
    seen = set()
    for index, original in enumerate(records, 1):
        if not isinstance(original, dict):
            rejected.append({"row": index, "reason": "invalid", "original": original})
            continue
        normalized = {clean(key): clean(value) for key, value in original.items()}
        if not normalized or any(not key for key in normalized):
            rejected.append({"row": index, "reason": "invalid", "original": original})
            continue
        if all(not value for value in normalized.values()):
            rejected.append({"row": index, "reason": "empty", "original": original})
            continue
        fingerprint = json.dumps(normalized, ensure_ascii=False, sort_keys=True)
        if fingerprint in seen:
            rejected.append({"row": index, "reason": "duplicate", "original": original})
            continue
        seen.add(fingerprint)
        accepted.append({"row": index, "original": original, "normalized": normalized})
    return {
        "summary": {"total": len(records), "accepted": len(accepted), "rejected": len(rejected)},
        "accepted": accepted,
        "rejected": rejected,
    }


def main():
    try:
        result = process(json.load(sys.stdin))
        json.dump({"ok": True, "result": result}, sys.stdout, ensure_ascii=False, allow_nan=False)
    except (ValueError, KeyError, UnicodeError, pd.errors.ParserError, pd.errors.EmptyDataError) as error:
        json.dump({"ok": False, "error": str(error)[:200]}, sys.stdout, ensure_ascii=False)


if __name__ == "__main__":
    main()
