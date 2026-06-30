import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (target === 0) {
      setValue(0)
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

function StatCard({ label, value, delay }) {
  const animated = useCountUp(value)

  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <span className="stat-value">{animated}</span>
      <span className="stat-label">{label}</span>
    </motion.div>
  )
}

export default function StatsBar({ current, longest, total, tags }) {
  return (
    <section className="stats-bar">
      <StatCard label="Current streak" value={current} delay={0} />
      <StatCard label="Longest streak" value={longest} delay={0.08} />
      <StatCard label="Total reads" value={total} delay={0.16} />
      <StatCard label="Unique tags" value={tags} delay={0.24} />
    </section>
  )
}
