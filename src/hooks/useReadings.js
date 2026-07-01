import { useCallback, useMemo, useState } from 'react'
import baseReadings from '../../data/readings.json'
import {
  addLocalReading,
  deleteLocalReading,
  importLocalReadings,
  loadLocalReadings,
  mergeReadings,
  updateLocalReading,
} from '../lib/readings'

export function useReadings() {
  const [localReadings, setLocalReadings] = useState(() => loadLocalReadings())

  const readings = useMemo(
    () => mergeReadings(baseReadings, localReadings),
    [localReadings],
  )

  const addReading = useCallback((entry) => {
    setLocalReadings(addLocalReading(entry))
  }, [])

  const updateReading = useCallback((id, patch) => {
    setLocalReadings(updateLocalReading(id, patch))
  }, [])

  const deleteReading = useCallback((id) => {
    setLocalReadings(deleteLocalReading(id))
  }, [])

  // Merges imported JSON into localStorage; returns the new local count. Throws
  // on invalid input so the caller can surface the error.
  const importReadings = useCallback((json) => {
    const next = importLocalReadings(json)
    setLocalReadings(next)
    return next.length
  }, [])

  return { readings, addReading, updateReading, deleteReading, importReadings }
}
