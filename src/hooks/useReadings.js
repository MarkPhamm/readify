import { useCallback, useMemo, useState } from 'react'
import baseReadings from '../../data/readings.json'
import {
  addLocalReading,
  loadLocalReadings,
  mergeReadings,
} from '../lib/readings'

export function useReadings() {
  const [localReadings, setLocalReadings] = useState(() => loadLocalReadings())

  const readings = useMemo(
    () => mergeReadings(baseReadings, localReadings),
    [localReadings],
  )

  const addReading = useCallback((entry) => {
    const next = addLocalReading(entry)
    setLocalReadings(next)
  }, [])

  return { readings, addReading }
}
