import { useEffect, useId, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function Modal({ open, onClose, title, children }) {
  const titleId = useId()
  const dialogRef = useRef(null)
  const restoreFocusRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    restoreFocusRef.current = document.activeElement

    const focusable = () => [...(dialogRef.current?.querySelectorAll(FOCUSABLE) ?? [])]

    const onKey = (event) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const items = focusable()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      const inside = dialogRef.current?.contains(active)

      if (event.shiftKey && (active === first || !inside)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || !inside)) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'

    // Focus the first field in the body (falls back to the dialog itself).
    const focusTimer = setTimeout(() => {
      const body = dialogRef.current?.querySelector('.modal-body')
      const target = body?.querySelector(FOCUSABLE) ?? dialogRef.current
      target?.focus()
    }, 0)

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      clearTimeout(focusTimer)
      const restore = restoreFocusRef.current
      if (restore && typeof restore.focus === 'function') restore.focus()
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            ref={dialogRef}
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <h2 id={titleId}>{title}</h2>
              <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
                ×
              </button>
            </div>
            <div className="modal-body">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
