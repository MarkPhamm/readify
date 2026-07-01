import { useEffect, useState } from 'react'
import { fetchPageMetadata, isValidUrl } from '../lib/readings'

const EMPTY = { title: '', hero: '', description: '' }

// Debounced page-metadata fetch. Given a URL string, returns the latest
// { title, hero, description } scraped from that page plus a `fetching` flag.
// Returns empty metadata (and never fetches) while the URL is invalid.
export function usePageMetadata(url, { debounce = 500 } = {}) {
  const [metadata, setMetadata] = useState(EMPTY)
  const [fetching, setFetching] = useState(false)

  const trimmedUrl = url.trim()
  const valid = isValidUrl(trimmedUrl)

  useEffect(() => {
    if (!valid) {
      setMetadata(EMPTY)
      setFetching(false)
      return undefined
    }

    let cancelled = false
    const timer = setTimeout(async () => {
      setFetching(true)
      const result = await fetchPageMetadata(trimmedUrl)
      if (cancelled) return
      setMetadata(result)
      setFetching(false)
    }, debounce)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [trimmedUrl, valid, debounce])

  return { metadata, fetching }
}
