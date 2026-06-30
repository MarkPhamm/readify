import { useMemo, useState } from 'react'
import StatsBar from './components/StatsBar'
import AddReading from './components/AddReading'
import StreakCalendar from './components/StreakCalendar'
import TagFilter from './components/TagFilter'
import ReadingList from './components/ReadingList'
import { useReadings } from './hooks/useReadings'
import {
  currentStreak,
  filterByTag,
  longestStreak,
  sortReadingsNewestFirst,
  toCalendarData,
  topTags,
  totalReads,
  uniqueTags,
} from './lib/stats'
import './styles.css'

export default function App() {
  const [activeTag, setActiveTag] = useState(null)
  const { readings, addReading } = useReadings()

  const stats = useMemo(
    () => ({
      current: currentStreak(readings),
      longest: longestStreak(readings),
      total: totalReads(readings),
      tags: uniqueTags(readings),
      tagList: topTags(readings),
      calendarData: toCalendarData(readings),
    }),
    [readings],
  )

  const filteredReadings = useMemo(() => {
    const filtered = filterByTag(readings, activeTag)
    return sortReadingsNewestFirst(filtered)
  }, [readings, activeTag])

  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="eyebrow">Personal reading tracker</p>
          <h1>Readify</h1>
          <p className="subtitle">GitHub-style streaks for what you read each day.</p>
        </div>
      </header>

      <AddReading onAdd={addReading} />

      <StatsBar
        current={stats.current}
        longest={stats.longest}
        total={stats.total}
        tags={stats.tags}
      />

      <StreakCalendar readings={readings} calendarData={stats.calendarData} />

      <TagFilter tags={stats.tagList} activeTag={activeTag} onSelect={setActiveTag} />

      <ReadingList readings={filteredReadings} />
    </div>
  )
}
