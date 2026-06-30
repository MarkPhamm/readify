import { useMemo } from 'react'
import { ActivityCalendar } from 'react-activity-calendar'
import { motion } from 'framer-motion'
import { byDay } from '../lib/stats'

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
            light: ['#262d3a', '#34507a', '#3f6db0', '#4f8fd6', '#73b2f0'],
            dark: ['#262d3a', '#34507a', '#3f6db0', '#4f8fd6', '#73b2f0'],
          }}
          colorScheme="dark"
          labels={{
            totalCount: '{{count}} reads in the last year',
          }}
          renderBlock={(block, activity) => {
            const entries = dayMap.get(activity.date)?.entries ?? []
            return (
              <motion.rect
                {...block}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: Math.random() * 0.3 }}
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
