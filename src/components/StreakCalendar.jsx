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

  return (
    <motion.section
      className="calendar-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h2>Reading activity</h2>
      <div className="calendar-wrap">
        {calendarData.length === 0 ? (
          <p className="empty-state">No readings yet. Log your first link above.</p>
        ) : (
          <ActivityCalendar
          data={calendarData}
          blockSize={12}
          blockMargin={3}
          fontSize={12}
          theme={{
            light: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
            dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
          }}
          colorScheme="dark"
          labels={{
            totalCount: '{{count}} reads in {{year}}',
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
        )}
      </div>
    </motion.section>
  )
}
