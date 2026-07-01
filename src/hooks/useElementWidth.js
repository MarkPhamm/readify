import { useEffect, useRef, useState } from 'react'

// Tracks the rendered width of an element via ResizeObserver. Returns
// [ref, width] — attach the ref to the element you want to measure.
export function useElementWidth() {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const element = ref.current
    if (!element) return undefined

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width)
      }
    })

    observer.observe(element)
    setWidth(element.clientWidth)

    return () => observer.disconnect()
  }, [])

  return [ref, width]
}
