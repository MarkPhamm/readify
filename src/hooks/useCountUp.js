import { useEffect, useState } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Animate a number from 0 up to `target`. Honors prefers-reduced-motion by
// snapping straight to the final value.
export function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (target === 0 || prefersReducedMotion()) {
      setValue(target)
      return undefined
    }

    let frame
    const start = performance.now()

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      setValue(Math.round(target * progress))
      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return value
}
