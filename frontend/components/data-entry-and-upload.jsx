import { useEffect, useRef, useState } from "react"
import { Check, ChevronDown, Database, FileSpreadsheet, LoaderCircle, Upload } from "lucide-react"

const sourceTypes = ["Planilla de ventas", "Stock e inventario", "Compras y proveedores", "Flujo de caja"]

function SelectField({ label, value, onChange, options }) {
  return <label className="block"><span className="mb-2 block text-sm font-medium text-[#dce1e8]">{label}</span><div className="relative"><select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full appearance-none rounded-lg border border-[#293546] bg-[#121a26] px-3.5 pr-10 text-sm text-[#f3f5f7] outline-none focus:border-[#ff6b19] focus:ring-2 focus:ring-[#ff6b19]/15"><option value="">Seleccioná una opción</option>{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3.5 text-[#8490a3]" size={16} /></div></label>
}

function Metric({ label, value, tone = "neutral" }) {
  const color = tone === "good" ? "text-[#6ee7b7]" : tone === "bad" ? "text-[#ff9584]" : "text-[#f3f5f7]"
  return <div className="rounded-lg border border-[#293546] bg-[#121a26] p-4"><p className="text-xs text-[#8490a3]">{label}</p><p className={`mt-1 text-xl font-semibold ${color}`}>{value}</p></div>
}

export default function DataEntry({ onDataReady }) {
  const inputRef = useRef(null)
  const [source, setSource] = useState(sourceTypes[0])
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [isReceiving, setIsReceiving] = useState(false)
  const [dataset, setDataset] = useState(null)

  useEffect(() => {
    if (!isReceiving) return undefined
    const timer = window.setInterval(() => setProgress((current) => Math.min(current + 10, 100)), 120)
    return () => window.clearInterval(timer)
  }, [isReceiving])

  const chooseFile = (event) => {
    const selected = event.target.files?.[0]
    if (!selected) return
    setFile(selected)
    setDataset(null)
    setProgress(0)
    setIsReceiving(false)
  }

  const receive = async () => {
    if (!file) return
    setIsReceiving(true)
    const text = await file.text()
    setDataset(onDataReady?.({ text, file }) ?? null)
    setTimeout(() => setIsReceiving(false), 1400)
  }

  return <main className="min-h-screen bg-[#090d15] text-[#f3f5f7] selection:bg-[#ff6b19]/30"><div className="mx-auto max-w-[1180px] px-5 py-8 lg:px-8 lg:py-10"><div className="mb-9 flex items-end justify-between gap-6"><div><p className="mb-2 text-xs font-medium uppercase tracking-[.18em] text-[#ff792c]">Datos</p><h1 className="text-2xl font-bold tracking-tight text-[#f7f8fa] sm:text-[30px]">Cargá tus datos</h1><p className="mt-2 max-w-xl text-sm text-[#8e9aac]">Elegí un CSV para el procesamiento completo en tu navegador.</p></div>{file && <div className="hidden items-center gap-3 rounded-lg border border-[#293546] bg-[#0f1621] px-3 py-2 text-xs text-[#8490a3] sm:flex"><Database size={15} className="text-[#ff792c]" /> {file.name}</div>}</div><div className="grid gap-6 lg:grid-cols-[1fr_300px]"><div className="space-y-6"><section className="rounded-xl border border-[#253142] bg-[#0f1621] p-5 sm:p-7"><div className="mb-7"><h2 className="text-lg font-semibold">Elegí qué datos querés recibir</h2></div><SelectField label="Fuente de datos" value={source} onChange={setSource} options={sourceTypes} /></section><section className="rounded-xl border border-[#253142] bg-[#0f1621] p-5 sm:p-7"><div className="mb-6 flex items-start justify-between"><div><h2 className="text-lg font-semibold">Cargá tu archivo</h2><p className="mt-1 text-sm text-[#8490a3]">Aceptamos archivos CSV de hasta 25 MB.</p></div><FileSpreadsheet className="text-[#ff792c]" size={21} /></div><input ref={inputRef} type="file" accept=".csv" onChange={chooseFile} className="sr-only" /><button type="button" onClick={() => inputRef.current?.click()} className="group flex min-h-[160px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#405066] bg-[#121a26] px-5 text-center transition hover:border-[#ff6b19] hover:bg-[#171e2b]"><span className="mb-3 grid size-11 place-items-center rounded-full bg-[#2a1a13] text-[#ff792c]"><Upload size={20} /></span><span className="text-sm font-medium text-[#e8edf3]">Arrastrá tu archivo acá o <span className="text-[#ff8a43]">seleccionalo</span></span><span className="mt-1 text-xs text-[#718096]">CSV · máximo 25 MB</span></button>{file && <div className="mt-5 rounded-lg border border-[#293546] bg-[#121a26] p-4"><div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-md bg-[#2a1a13] text-[#ff792c]"><FileSpreadsheet size={18} /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-[#edf1f5]">{file.name}</p><p className="mt-0.5 text-xs text-[#8490a3]">{(file.size / 1024 / 1024).toFixed(1)} MB · {isReceiving ? "Procesando archivo..." : progress === 100 ? "Listo para recibir" : "Seleccionado"}</p></div>{isReceiving ? <LoaderCircle className="animate-spin text-[#ff792c]" size={18} /> : progress === 100 && <Check className="text-[#6ee7b7]" size={18} />}</div>{isReceiving && <div className="mt-4"><div className="mb-1.5 flex justify-between text-[11px] text-[#8490a3]"><span>Analizando archivo</span><span>{progress}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-[#253142]"><div className="h-full rounded-full bg-[#ff6b19] transition-all" style={{ width: `${progress}%` }} /></div></div>}</div>}<button type="button" onClick={receive} disabled={!file || isReceiving} className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#ff6b19] text-sm font-semibold text-white shadow-lg shadow-[#ff6b19]/15 transition hover:bg-[#ff7c31] disabled:cursor-not-allowed disabled:opacity-40"><Check size={16} /> Recibir datos</button></section><section className="rounded-xl border border-[#253142] bg-[#0f1621] p-5 sm:p-7"><div className="mb-6"><h2 className="text-lg font-semibold">Resultado de la recepción</h2><p className="mt-1 text-sm text-[#8490a3]">Las métricas aparecerán después de recibir el CSV.</p></div>{dataset ? <div className="grid grid-cols-3 gap-3"><Metric label="Registros leídos" value={dataset.total} /><Metric label="Aceptados" value={dataset.valid} tone="good" /><Metric label="Rechazados" value={dataset.rejected} tone="bad" /></div> : <div className="rounded-lg border border-dashed border-[#293546] bg-[#121a26] p-5 text-sm text-[#8490a3]">No hay datos procesados todavía.</div>}</section></div><aside className="hidden lg:block"><div className="sticky top-6 rounded-xl border border-[#253142] bg-[#0f1621] p-5"><div className="flex gap-3 text-xs leading-5 text-[#8490a3]"><Database className="mt-0.5 shrink-0 text-[#ff792c]" size={15} /></div></div></aside></div></div></main>
}
