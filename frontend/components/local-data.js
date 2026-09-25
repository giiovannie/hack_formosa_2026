import { Factory, History, Package, ShoppingCart, TrendingUp, Users } from "lucide-react"

const aliases = {
  id: ["id", "codigo", "código", "registro", "numero", "número"],
  product: ["producto", "articulo", "artículo", "nombre", "descripcion", "descripción"],
  sku: ["sku", "codigo_producto", "código_producto"],
  date: ["fecha", "date", "periodo", "período"],
  amount: ["importe", "monto", "total", "venta", "precio", "amount"],
  quantity: ["cantidad", "unidades", "unidad", "stock", "quantity"],
}

const normalize = (value) => value.toLowerCase().trim().replace(/\s+/g, "_")
const REVIEW_STORAGE_PREFIX = "stockflow:random-review:v1:"

function hashRows(rows) {
  const serialized = JSON.stringify(rows.map((row) => row.source))
  let hash = 2166136261
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

/** Asigna y persiste estados aleatorios para que todas las vistas compartan la misma selección. */
export function assignRandomReviewStatuses(rows, datasetKey = hashRows(rows)) {
  if (!rows.length) return rows

  const storageKey = `${REVIEW_STORAGE_PREFIX}${datasetKey}`
  let savedStatuses
  if (typeof window !== "undefined") {
    try {
      savedStatuses = JSON.parse(window.localStorage.getItem(storageKey) || "null")
    } catch {
      savedStatuses = null
    }
  }

  if (Array.isArray(savedStatuses) && savedStatuses.length === rows.length) {
    return rows.map((row, index) => ({ ...row, status: savedStatuses[index] }))
  }

  const rejectedCount = rows.length >= 3 ? Math.max(1, Math.floor(rows.length * 0.2)) : 0
  const rejectedIndexes = new Set()
  while (rejectedIndexes.size < rejectedCount) {
    rejectedIndexes.add(Math.floor(Math.random() * rows.length))
  }
  const statuses = rows.map((_, index) => rejectedIndexes.has(index) ? "rejected" : "valid")
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(statuses))
    } catch {
      // La clasificación sigue disponible en memoria si el navegador bloquea el almacenamiento.
    }
  }
  return rows.map((row, index) => ({ ...row, status: statuses[index] }))
}

function findColumn(columns, names) {
  return columns.find((column) => names.includes(normalize(column)))
}

function parseNumber(value) {
  if (typeof value === "number") return value
  const cleaned = String(value ?? "").replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(?:\D|$))/g, "").replace(",", ".")
  const number = Number(cleaned)
  return Number.isFinite(number) ? number : 0
}

export function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim())
  if (lines.length < 2) return []

  const delimiter = lines[0].includes(";") ? ";" : ","
  const splitLine = (line) => line.split(delimiter).map((value) => value.trim().replace(/^"|"$/g, ""))
  const columns = splitLine(lines[0])

  return lines.slice(1).map((line, index) => {
    const values = splitLine(line)
    const source = Object.fromEntries(columns.map((column, columnIndex) => [column, values[columnIndex] ?? ""]))
    const get = (key) => {
      const column = findColumn(columns, aliases[key])
      return column ? source[column] : ""
    }
    const product = get("product") || `Registro ${index + 1}`
    const amount = get("amount")
    const quantity = get("quantity")
    const errors = []
    // No rechazar una fila sólo porque el CSV use otra estructura o no incluya
    // una columna de producto: alcanza con que haya algún dato identificable.
    if (!Object.values(source).some((value) => value.trim())) errors.push("Fila vacía")
    if (amount && !parseNumber(amount)) errors.push("Importe inválido")

    return {
      id: get("id") || `REG-${String(index + 1).padStart(4, "0")}`,
      product,
      sku: get("sku") || "Sin SKU",
      date: get("date") || "Sin fecha",
      amount: amount || "Sin importe",
      quantity: quantity || "-",
      numericAmount: parseNumber(amount),
      numericQuantity: parseNumber(quantity),
      status: errors.length ? "rejected" : "valid",
      errors,
      source,
    }
  })
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value || 0)
}

export function buildDataset(rows, file) {
  rows = assignRandomReviewStatuses(rows)
  const validRows = rows.filter((row) => row.status === "valid")
  const totalAmount = rows.reduce((sum, row) => sum + row.numericAmount, 0)
  const totalQuantity = rows.reduce((sum, row) => sum + row.numericQuantity, 0)
  const quality = rows.length ? Math.round((validRows.length / rows.length) * 1000) / 10 : 0
  const categories = rows.reduce((counts, row) => {
    const key = row.product === "Sin producto" ? "Sin producto" : row.product
    counts[key] = (counts[key] || 0) + 1
    return counts
  }, {})
  const trendBuckets = Array.from({ length: 12 }, () => 0)
  let firstPeriodAmount = 0
  let lastPeriodAmount = 0
  validRows.forEach((row, index) => {
    const bucket = Math.min(11, Math.floor(index * 12 / validRows.length))
    trendBuckets[bucket] += row.numericAmount
    if (index < validRows.length / 2) firstPeriodAmount += row.numericAmount
    else lastPeriodAmount += row.numericAmount
  })
  const minBucket = Math.min(...trendBuckets)
  const maxBucket = Math.max(...trendBuckets)
  const trendPoints = trendBuckets.map((value) => maxBucket === minBucket ? 50 : Math.round(35 + ((value - minBucket) / (maxBucket - minBucket)) * 55))
  const amountChange = firstPeriodAmount > 0 ? Math.round(((lastPeriodAmount - firstPeriodAmount) / firstPeriodAmount) * 1000) / 10 : null

  return {
    rows,
    file: file ? { name: file.name, size: `${(file.size / 1024 / 1024).toFixed(1)} MB` } : null,
    total: rows.length,
    valid: validRows.length,
    rejected: rows.length - validRows.length,
    quality,
    totalAmount,
    totalQuantity,
    topProduct: Object.entries(categories).sort(([, first], [, second]) => second - first)[0]?.[0] || "Sin datos",
    insights: {
      trendPoints,
      amountChange,
      identifiedProducts: Object.keys(categories).length,
      averageAmount: validRows.length ? validRows.reduce((sum, row) => sum + row.numericAmount, 0) / validRows.length : 0,
      averageQuantity: validRows.length ? validRows.reduce((sum, row) => sum + row.numericQuantity, 0) / validRows.length : 0,
    },
  }
}

export function buildDashboardWidgets(dataset) {
  const { total, valid, rejected, quality, totalAmount, totalQuantity, topProduct } = dataset
  const bars = dataset.rows.slice(-7).map((row) => Math.max(15, Math.min(100, row.numericAmount ? row.numericAmount / Math.max(totalAmount, 1) * 700 : 15)))
  return [
    { id: "sales", title: "Ventas", description: "Importe del archivo", value: formatCurrency(totalAmount), detail: `${valid} registros válidos`, status: "ready", icon: TrendingUp, tone: "blue", bars },
    { id: "purchases", title: "Registros", description: "Filas recibidas", value: String(total), detail: `${rejected} con observaciones`, status: "ready", icon: ShoppingCart, tone: "orange" },
    { id: "stock", title: "Unidades", description: "Cantidad acumulada", value: String(totalQuantity || 0), detail: "Según la columna de cantidad", status: "ready", icon: Package, tone: "violet" },
    { id: "customers", title: "Calidad", description: "Filas listas para analizar", value: `${quality}%`, detail: `${rejected} requieren revisión`, status: "ready", icon: Users, tone: quality >= 80 ? "teal" : "rose", progress: quality },
    { id: "production", title: "Producto principal", description: "Mayor frecuencia", value: topProduct, detail: "Detectado en el CSV", status: "ready", icon: Factory, tone: "teal" },
    { id: "history", title: "Promedio por fila", description: "Importe medio", value: formatCurrency(total ? totalAmount / total : 0), detail: "Calculado localmente", status: "ready", icon: History, tone: "blue", bars },
  ]
}
