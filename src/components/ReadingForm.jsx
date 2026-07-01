import { useEffect, useState } from 'react'
import { fetchPageMetadata, formatDate, isValidUrl } from '../lib/readings'
import { usePageMetadata } from '../hooks/usePageMetadata'

// Shared add/edit form. Pass `initialValue` to edit an existing reading;
// omit it to add a new one. Calls `onSubmit(entry)` with the field values
// (the caller decides whether that's an add or an update).
export default function ReadingForm({ initialValue = null, onSubmit, onSubmitted }) {
  const isEdit = Boolean(initialValue)
  const initialUrl = initialValue?.url ?? ''

  const [url, setUrl] = useState(initialUrl)
  const [date, setDate] = useState(initialValue?.date ?? formatDate(new Date()))
  const [tags, setTags] = useState((initialValue?.tags ?? []).join(', '))
  const [note, setNote] = useState(initialValue?.note ?? '')
  const [title, setTitle] = useState(initialValue?.title ?? '')
  const [hero, setHero] = useState(initialValue?.hero ?? '')
  const [description, setDescription] = useState(initialValue?.description ?? '')
  // In edit mode the title/image are prefilled, so treat them as user-owned.
  const [titleTouched, setTitleTouched] = useState(isEdit)
  const [heroTouched, setHeroTouched] = useState(isEdit)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { metadata, fetching } = usePageMetadata(url)

  // Sync auto-fetched metadata into the editable fields, but only when the URL
  // differs from the one we loaded — so editing a reading doesn't clobber its
  // saved hero/description with a re-fetch of the same page. Never overwrite a
  // field the user has typed into.
  useEffect(() => {
    if (url.trim() === initialUrl.trim()) return
    setDescription(metadata.description)
    if (!titleTouched) setTitle(metadata.title)
    if (!heroTouched) setHero(metadata.hero)
  }, [metadata, url, initialUrl, titleTouched, heroTouched])

  const noImageFound = isValidUrl(url.trim()) && !fetching && heroTouched === false && !metadata.hero

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

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
      const meta = await fetchPageMetadata(trimmedUrl)
      if (!resolvedTitle) resolvedTitle = meta.title
      if (!resolvedHero) resolvedHero = meta.hero
      if (!resolvedDescription) resolvedDescription = meta.description
    }

    const tagList = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    onSubmit({
      date,
      url: trimmedUrl,
      title: resolvedTitle,
      hero: resolvedHero,
      description: resolvedDescription,
      tags: tagList,
      note: note.trim(),
    })

    setLoading(false)
    if (onSubmitted) onSubmitted()
  }

  const showPreview = isValidUrl(url.trim()) && (fetching || title || hero || description)

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <label className="field" htmlFor="reading-url">
        <span>
          Link<span className="field-required" aria-hidden="true"> *</span>
        </span>
        <input
          id="reading-url"
          type="url"
          placeholder="https://example.com/article"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          aria-required="true"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? 'reading-form-error' : undefined}
          required
        />
      </label>

      {showPreview ? (
        <div className="page-preview">
          {fetching ? (
            <p className="preview-loading">Fetching page details…</p>
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
        <label className="field" htmlFor="reading-date">
          <span>
            Date<span className="field-required" aria-hidden="true"> *</span>
          </span>
          <input
            id="reading-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            aria-required="true"
            required
          />
        </label>

        <label className="field" htmlFor="reading-tags">
          <span>Tags</span>
          <input
            id="reading-tags"
            type="text"
            placeholder="ml, systems"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
          />
        </label>
      </div>

      <label className="field" htmlFor="reading-title">
        <span>Title override (optional)</span>
        <input
          id="reading-title"
          type="text"
          placeholder="Auto-fetched from the page"
          value={title}
          onChange={(event) => {
            setTitleTouched(true)
            setTitle(event.target.value)
          }}
        />
      </label>

      <label className="field" htmlFor="reading-image">
        <span>Image URL (optional)</span>
        <input
          id="reading-image"
          type="url"
          placeholder="Auto-fetched — or paste an image link"
          value={hero}
          onChange={(event) => {
            setHeroTouched(true)
            setHero(event.target.value)
          }}
        />
        {noImageFound ? (
          <small className="field-hint">
            No image found for this link — paste an image URL to set one.
          </small>
        ) : null}
      </label>

      <label className="field" htmlFor="reading-note">
        <span>Note (optional)</span>
        <input
          id="reading-note"
          type="text"
          placeholder="A quick note about this read"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </label>

      {error ? (
        <p className="form-message error" id="reading-form-error" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="submit-btn" disabled={loading || fetching}>
        {loading ? (isEdit ? 'Saving…' : 'Adding…') : isEdit ? 'Save changes' : 'Add reading'}
      </button>
    </form>
  )
}
