import { motion } from 'framer-motion'
import { useCountUp } from '../hooks/useCountUp'

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
  const currentAnimated = useCountUp(current)

  return (
    <div className="hero-top">
      <motion.div
        className="streak-hero"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <span className="streak-hero-value">{currentAnimated}</span>
        <span className="streak-hero-label">
          {current === 1 ? 'day' : 'days'} current reading streak
        </span>
      </motion.div>

      <div className="hero-stats">
        <StatCard label="Longest streak" value={longest} delay={0.06} />
        <StatCard label="Total reads" value={total} delay={0.12} />
        <StatCard label="Unique tags" value={tags} delay={0.18} />
      </div>
    </div>
  )
}
