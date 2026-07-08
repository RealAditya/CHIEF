import React, { useEffect, useState, useCallback } from 'react'
import TopNav from './components/TopNav'
import Calendar from './components/Calendar'
import TodayPanel from './components/TodayPanel'
import CommandBar from './components/CommandBar'
import CreateEventModal from './components/CreateEventModal'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export default function App() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [selectedEventId, setSelectedEventId] = useState(null)

  const loadEvents = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(`${API_BASE}/events`)
      if (res.ok) {
        const data = await res.json()
        setEvents(data)
      } else {
        setError(true)
        console.error('Failed to load events', res.statusText)
      }
    } catch (err) {
      setError(true)
      console.error('Error fetching events', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  function openQuickAdd(){
    setModalOpen(true)
  }
  function closeModal(){
    setModalOpen(false)
  }

  function onEventCreated(ev){
    // refresh events after creation
    loadEvents()
  }

  function onSelectDay(date){
    setSelectedDate(date)
    setSelectedEventId(null)
  }

  function onSelectEvent(ev){
    setSelectedEventId(ev.id)
    // also set selected date to the event date
    setSelectedDate(new Date(ev.start_datetime))
  }

  return (
    <div className="app-root">
      <TopNav />
      {error && <div className="banner">Unable to connect to CHIEF backend.</div>}
      <main className="main-grid">
        <section className="calendar-area">
          <div className="calendar-header">
            <h2>Monthly Calendar</h2>
            <button className="quick-add" onClick={openQuickAdd}>+ Quick Add</button>
          </div>
          <Calendar
            events={events}
            loading={loading}
            selectedDate={selectedDate}
            onSelectDay={onSelectDay}
            onSelectEvent={onSelectEvent}
            selectedEventId={selectedEventId}
          />
        </section>

        <aside className="today-area">
          <TodayPanel
            events={events}
            loading={loading}
            selectedDate={selectedDate}
            selectedEventId={selectedEventId}
            onSelectEvent={onSelectEvent}
          />
        </aside>
      </main>

      <CommandBar />

      <CreateEventModal open={modalOpen} onClose={closeModal} onCreated={onEventCreated} defaultDate={selectedDate} />
    </div>
  )
}
