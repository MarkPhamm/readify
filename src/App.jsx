import { useMemo, useState } from 'react'
import NavBar from './components/NavBar'
import Modal from './components/Modal'
import StatsBar from './components/StatsBar'
import ReadingForm from './components/ReadingForm'
import StreakCalendar from './components/StreakCalendar'
import ReadingTrend from './components/ReadingTrend'
import Filters from './components/Filters'
import ReadingList from './components/ReadingList'
import { useReadings } from './hooks/useReadings'
import {
  currentStreak,
  filterByTag,
  longestStreak,
  searchReadings,
  sortReadingsNewestFirst,
  toCalendarData,
  topTags,
  totalReads,
  uniqueTags,
} from './lib/stats'
import './styles.css'

export default function App() {
  const [activeTag, setActiveTag] = useState(null)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const { readings, addReading, updateReading, deleteReading } = useReadings()

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

  const isFiltered = activeTag !== null || query.trim() !== ''

  const filteredReadings = useMemo(() => {
    const byTag = filterByTag(readings, activeTag)
    const searched = searchReadings(byTag, query)
    return sortReadingsNewestFirst(searched)
  }, [readings, activeTag, query])

  function openAdd() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(reading) {
    setEditing(reading)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(null)
  }

  function handleSubmit(entry) {
    if (editing) {
      updateReading(editing.id, entry)
    } else {
      addReading(entry)
    }
  }

  return (
    <>
      <NavBar onAddClick={openAdd} />

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

        {readings.length > 0 ? (
          <Filters
            query={query}
            onQueryChange={setQuery}
            tags={stats.tagList}
            activeTag={activeTag}
            onSelectTag={setActiveTag}
          />
        ) : null}

        <ReadingList
          readings={filteredReadings}
          filtered={isFiltered}
          onEdit={openEdit}
          onDelete={deleteReading}
        />
      </main>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit reading' : 'Log a reading'}>
        <ReadingForm
          key={editing?.id ?? 'new'}
          initialValue={editing}
          onSubmit={handleSubmit}
          onSubmitted={closeModal}
        />
      </Modal>
    </>
  )
}
