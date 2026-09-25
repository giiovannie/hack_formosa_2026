import { useEffect } from "react"
import { motion, useAnimate, useReducedMotion } from "framer-motion"

export default function PageEntrance({ children }) {
  const [scope, animate] = useAnimate()
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!scope.current?.querySelector("[data-page-enter]")) return undefined

    const controls = animate(
      "[data-page-enter]",
      { opacity: [0, 1], y: [reduceMotion ? 0 : 18, 0] },
      {
        duration: reduceMotion ? 0 : 0.45,
        delay: reduceMotion ? 0 : (index) => index * 0.09,
        ease: [0.22, 1, 0.36, 1],
      },
    )

    return () => {
      controls.stop()
    }
  }, [animate, reduceMotion, scope])

  return <motion.div ref={scope}>{children}</motion.div>
}
