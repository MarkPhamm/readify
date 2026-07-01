import { useMemo } from 'react'
import { ActivityCalendar } from 'react-activity-calendar'
import { motion } from 'framer-motion'
import { byDay } from '../lib/stats'
import { CALENDAR_LEVELS } from '../lib/palette'

// Deterministic 0–0.29s stagger derived from the date string, so blocks fade in
// with a stable, non-jittery wave (no Math.random re-rolling on every render).
function staggerDelay(dateStr) {
  let sum = 0
  for (let i = 0; i < dateStr.length; i += 1) sum += dateStr.charCodeAt(i)
  return (sum % 50) * 0.006
}

function formatTooltip(date, entries) {
  if (!entries || entries.length === 0) {
    return `${date}: no reads`
  }

  const titles = entries.map((entry) => entry.title || entry.url).join(', ')
  const countLabel = entries.length === 1 ? '1 read' : `${entries.length} reads`
  return `${date}: ${countLabel} — ${titles}`
}

export default function StreakCalendar({ readings, calendarData }) {
  const dayMap = useMemo(() => byDay(readings), [readings])
  const hasReads = readings.length > 0

  return (
    <motion.section
      className="panel graph-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h2 className="panel-title">Reading activity</h2>
      <div className="calendar-wrap">
        <ActivityCalendar
          data={calendarData}
          blockSize={13}
          blockMargin={4}
          fontSize={12}
          theme={{
            light: CALENDAR_LEVELS,
            dark: CALENDAR_LEVELS,
          }}
          colorScheme="dark"
          labels={{
            totalCount: '{{count}} reads in the last year',
          }}
          renderBlock={(block, activity) => {
            const entries = dayMap.get(activity.date)?.entries ?? []
            // `block` is the pre-built <rect> element — its geometry/fill live in
            // block.props, so spread those (not the element itself) onto motion.rect.
            return (
              <motion.rect
                key={block.key}
                {...block.props}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: staggerDelay(activity.date) }}
              >
                <title>{formatTooltip(activity.date, entries)}</title>
              </motion.rect>
            )
          }}
        />
      </div>
      {!hasReads ? (
        <p className="calendar-caption">No readings yet — add your first to start your streak.</p>
      ) : null}
    </motion.section>
  )
}
