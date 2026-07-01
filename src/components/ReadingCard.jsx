import { useState } from 'react'
import { motion } from 'framer-motion'

const EDIT_PATH =
  'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'
const TRASH_PATH =
  'M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z'

function Icon({ path }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d={path} />
    </svg>
  )
}

export default function ReadingCard({ reading, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false)
  const editable = reading.source === 'local'
  const label = reading.title || reading.url

  return (
    <motion.li
      className="reading-card"
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25 }}
    >
      <a className="card-link" href={reading.url} target="_blank" rel="noreferrer">
        {reading.hero ? (
          <img className="card-hero" src={reading.hero} alt="" loading="lazy" />
        ) : (
          <div className="card-hero placeholder" />
        )}
        <div className="card-body">
          <span className="card-date">{reading.date}</span>
          <span className="card-title">{label}</span>
          {reading.description ? <p className="card-description">{reading.description}</p> : null}
        </div>
      </a>

      {reading.note ? <p className="card-note">{reading.note}</p> : null}

      <div className="card-footer">
        {(reading.tags ?? []).length > 0 ? (
          <div className="card-tags">
            {reading.tags.map((tag) => (
              <span key={tag} className="timeline-tag">
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <span />
        )}

        {editable ? (
          confirming ? (
            <div className="card-confirm" role="group" aria-label="Confirm delete">
              <span className="card-confirm-text">Delete?</span>
              <button
                type="button"
                className="card-action danger"
                onClick={() => onDelete(reading.id)}
              >
                Yes
              </button>
              <button
                type="button"
                className="card-action"
                onClick={() => setConfirming(false)}
              >
                No
              </button>
            </div>
          ) : (
            <div className="card-actions">
              <button
                type="button"
                className="card-action-icon"
                aria-label={`Edit “${label}”`}
                onClick={() => onEdit(reading)}
              >
                <Icon path={EDIT_PATH} />
              </button>
              <button
                type="button"
                className="card-action-icon"
                aria-label={`Delete “${label}”`}
                onClick={() => setConfirming(true)}
              >
                <Icon path={TRASH_PATH} />
              </button>
            </div>
          )
        ) : null}
      </div>
    </motion.li>
  )
}
