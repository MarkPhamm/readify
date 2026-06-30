import { useMemo, useState } from 'react'
import NavBar from './components/NavBar'
import Modal from './components/Modal'
import StatsBar from './components/StatsBar'
import AddReading from './components/AddReading'
import StreakCalendar from './components/StreakCalendar'
import ReadingTrend from './components/ReadingTrend'
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
  const [modalOpen, setModalOpen] = useState(false)
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
    <>
      <NavBar onAddClick={() => setModalOpen(true)} />

      <main className="app">
        <section className="hero-panel">
          <StatsBar
            current={stats.current}
            longest={stats.longest}
            total={stats.total}
            tags={stats.tags}
          />
          <StreakCalendar readings={readings} calendarData={stats.calendarData} />
        </section>

        <ReadingTrend readings={readings} />

        <TagFilter tags={stats.tagList} activeTag={activeTag} onSelect={setActiveTag} />

        <ReadingList readings={filteredReadings} />
      </main>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Log a reading">
        <AddReading onAdd={addReading} onSubmitted={() => setModalOpen(false)} />
      </Modal>
    </>
  )
}
