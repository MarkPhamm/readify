import { AnimatePresence } from 'framer-motion'
import ReadingCard from './ReadingCard'

function monthLabel(dateStr) {
  const [year, month] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
}

function groupByMonth(readings) {
  const groups = new Map()

  for (const reading of readings) {
    const key = reading.date.slice(0, 7)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(reading)
  }

  return [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0]))
}

export default function ReadingList({ readings, filtered = false, onEdit, onDelete }) {
  if (readings.length === 0) {
    return (
      <section className="panel reading-list">
        <h2 className="panel-title">Timeline</h2>
        <p className="empty-state">
          {filtered
            ? 'No readings match your search or filter.'
            : 'No readings yet — add your first with the “Add reading” button.'}
        </p>
      </section>
    )
  }

  const groups = groupByMonth(readings)

  return (
    <section className="panel reading-list">
      <h2 className="panel-title">Timeline</h2>
      {groups.map(([key, items]) => (
        <div className="month-group" key={key}>
          <h3 className="month-heading">{monthLabel(items[0].date)}</h3>
          <ul className="card-grid">
            <AnimatePresence mode="popLayout">
              {items.map((reading) => (
                <ReadingCard
                  key={reading.id}
                  reading={reading}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </AnimatePresence>
          </ul>
        </div>
      ))}
    </section>
  )
}
