import { AnimatePresence, motion } from 'framer-motion'

export default function ReadingList({ readings }) {
  if (readings.length === 0) {
    return (
      <section className="reading-list">
        <h2>Timeline</h2>
        <p className="empty-state">No readings match this filter.</p>
      </section>
    )
  }

  return (
    <section className="reading-list">
      <h2>Timeline</h2>
      <ul className="timeline">
        <AnimatePresence mode="popLayout">
          {readings.map((reading) => (
            <motion.li
              key={`${reading.date}-${reading.url}`}
              className="timeline-item"
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.25 }}
            >
              <time className="timeline-date">{reading.date}</time>
              <div className="timeline-content">
                <a href={reading.url} target="_blank" rel="noreferrer">
                  {reading.title || reading.url}
                </a>
                {reading.note ? <p className="timeline-note">{reading.note}</p> : null}
                <div className="timeline-tags">
                  {(reading.tags ?? []).map((tag) => (
                    <span key={tag} className="timeline-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  )
}
