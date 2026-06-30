import { useEffect, useState } from 'react'
import { fetchPageMetadata, formatDate, isValidUrl } from '../lib/readings'

export default function AddReading({ onAdd, onSubmitted }) {
  const [url, setUrl] = useState('')
  const [date, setDate] = useState(formatDate(new Date()))
  const [tags, setTags] = useState('')
  const [note, setNote] = useState('')
  const [title, setTitle] = useState('')
  const [hero, setHero] = useState('')
  const [description, setDescription] = useState('')
  const [titleTouched, setTitleTouched] = useState(false)
  const [fetchingMeta, setFetchingMeta] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const trimmedUrl = url.trim()
    if (!isValidUrl(trimmedUrl)) {
      setHero('')
      setDescription('')
      if (!titleTouched) setTitle('')
      return undefined
    }

    let cancelled = false
    const timer = setTimeout(async () => {
      setFetchingMeta(true)
      setError('')

      const metadata = await fetchPageMetadata(trimmedUrl)
      if (cancelled) return

      if (!titleTouched) setTitle(metadata.title)
      setHero(metadata.hero)
      setDescription(metadata.description)
      setFetchingMeta(false)
    }, 500)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [url, titleTouched])

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
    let resolvedHero = hero
    let resolvedDescription = description

    if (!resolvedTitle || !resolvedHero) {
      const metadata = await fetchPageMetadata(trimmedUrl)
      if (!resolvedTitle) resolvedTitle = metadata.title
      if (!resolvedHero) resolvedHero = metadata.hero
      if (!resolvedDescription) resolvedDescription = metadata.description
    }

    const tagList = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    onAdd({
      date,
      url: trimmedUrl,
      title: resolvedTitle,
      hero: resolvedHero,
      description: resolvedDescription,
      tags: tagList,
      note: note.trim(),
    })

    setUrl('')
    setTags('')
    setNote('')
    setTitle('')
    setHero('')
    setDescription('')
    setTitleTouched(false)
    setDate(formatDate(new Date()))
    setSuccess('Reading added.')
    setLoading(false)

    if (onSubmitted) onSubmitted()
  }

  const showPreview = isValidUrl(url.trim()) && (fetchingMeta || title || hero || description)

  return (
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

        {showPreview ? (
          <div className="page-preview">
            {fetchingMeta ? (
              <p className="preview-loading">Fetching page details...</p>
            ) : (
              <>
                {hero ? (
                  <img className="preview-hero" src={hero} alt="" />
                ) : (
                  <div className="preview-hero placeholder" />
                )}
                <div className="preview-text">
                  <p className="preview-title">{title || 'Untitled page'}</p>
                  {description ? <p className="preview-description">{description}</p> : null}
                </div>
              </>
            )}
          </div>
        ) : null}

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
          <span>Title override (optional)</span>
          <input
            type="text"
            placeholder="Auto-fetched from the page"
            value={title}
            onChange={(event) => {
              setTitleTouched(true)
              setTitle(event.target.value)
            }}
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

        <button type="submit" className="submit-btn" disabled={loading || fetchingMeta}>
          {loading ? 'Adding...' : 'Add reading'}
        </button>
    </form>
  )
}
