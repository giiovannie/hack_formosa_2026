import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion"
import { useEffect, useMemo } from "react"

function parseNumber(value) {
  const text = String(value)
  const match = text.match(/[+-]?\d[\d.,]*/)

  if (!match) return null

  const raw = match[0]
  let normalized = raw
  const decimalPlaces = raw.includes(",") ? raw.length - raw.lastIndexOf(",") - 1 : 0

  if (raw.includes(",")) {
    normalized = raw.replaceAll(".", "").replace(",", ".")
  } else if (/^\d{1,3}(\.\d{3})+$/.test(raw)) {
    normalized = raw.replaceAll(".", "")
  }

  const target = Number(normalized)
  if (!Number.isFinite(target)) return null

  return {
    target,
    prefix: text.slice(0, match.index),
    suffix: text.slice(match.index + raw.length),
    decimalPlaces,
    minimumIntegerDigits: /^0\d/.test(raw.replace(/[.,]/g, "")) ? raw.replace(/[.,]/g, "").length : 1,
  }
}

export default function AnimatedNumber({ value, delay = 0, duration = 1.25 }) {
  const parsed = useMemo(() => parseNumber(value), [value])
  const progress = useMotionValue(0)
  const reduceMotion = useReducedMotion()
  const formatter = useMemo(() => new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: parsed?.decimalPlaces ?? 0,
    maximumFractionDigits: parsed?.decimalPlaces ?? 0,
    minimumIntegerDigits: parsed?.minimumIntegerDigits ?? 1,
  }), [parsed])
  const display = useTransform(progress, (current) => formatter.format(current))

  useEffect(() => {
    if (!parsed) return undefined

    const controls = animate(progress, parsed.target, {
      duration: reduceMotion ? 0 : duration,
      delay: reduceMotion ? 0 : delay,
      ease: [0.22, 1, 0.36, 1],
    })

    return () => controls.stop()
  }, [delay, duration, parsed, progress, reduceMotion])

  if (!parsed) return value

  return <>{parsed.prefix}<motion.span>{display}</motion.span>{parsed.suffix}</>
}
