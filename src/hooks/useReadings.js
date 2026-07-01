import { useCallback, useMemo, useState } from 'react'
import baseReadings from '../../data/readings.json'
import {
  addLocalReading,
  deleteLocalReading,
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

  return { readings, addReading, updateReading, deleteReading }
}
