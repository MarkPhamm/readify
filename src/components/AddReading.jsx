import { useState } from 'react'
import { motion } from 'framer-motion'
import { fetchTitle, formatDate, isValidUrl } from '../lib/readings'

export default function AddReading({ onAdd }) {
  const [url, setUrl] = useState('')
  const [date, setDate] = useState(formatDate(new Date()))
  const [tags, setTags] = useState('')
  const [note, setNote] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const trimmedUrl = url.trim()
    if (!isValidUrl(trimmedUrl)) {
      setError('Please enter a valid http(s) URL.')
      return
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError('Date must be in YYYY-MM-DD format.')
      return
    }

    setLoading(true)

    let resolvedTitle = title.trim()
    if (!resolvedTitle) {
      resolvedTitle = await fetchTitle(trimmedUrl)
    }

    const tagList = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    onAdd({
      date,
      url: trimmedUrl,
      title: resolvedTitle,
      tags: tagList,
      note: note.trim(),
    })

    setUrl('')
    setTags('')
    setNote('')
    setTitle('')
    setDate(formatDate(new Date()))
    setSuccess('Reading added.')
    setLoading(false)
  }

  return (
    <motion.section
      className="add-reading"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2>Log a reading</h2>
      <form className="add-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Link</span>
          <input
            type="url"
            placeholder="https://example.com/article"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            required
          />
        </label>

        <div className="field-row">
          <label className="field">
            <span>Date</span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Tags</span>
            <input
              type="text"
              placeholder="ml, systems"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
            />
          </label>
        </div>

        <label className="field">
          <span>Title (optional)</span>
          <input
            type="text"
            placeholder="Auto-fetched from the page"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>

        <label className="field">
          <span>Note (optional)</span>
          <input
            type="text"
            placeholder="A quick note about this read"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>

        {error ? <p className="form-message error">{error}</p> : null}
        {success ? <p className="form-message success">{success}</p> : null}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Adding...' : 'Add reading'}
        </button>
      </form>
    </motion.section>
  )
}
