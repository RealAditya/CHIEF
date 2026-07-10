import React, { useEffect, useState, useCallback } from 'react'
import TopNav from './components/TopNav'
import Calendar from './components/Calendar'
import TodayPanel from './components/TodayPanel'
import CommandBar from './components/CommandBar'
import CreateEventModal from './components/CreateEventModal'
import SmartAddModal from './components/SmartAddModal'
import uiText from './config/uiText'
import keyboardShortcuts from './config/keyboardShortcuts'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export default function App() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [smartAddOpen, setSmartAddOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [selectedEventId, setSelectedEventId] = useState(null)
  const [visibleDate, setVisibleDate] = useState(() => new Date())
  const [viewMode, setViewMode] = useState('month')

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

  function openManualEvent(){
    setModalEvent(null)
    setModalOpen(true)
  }

  function openSmartAdd(){
    setSmartAddOpen(true)
  }

  function closeModal(){
    setModalOpen(false)
    setModalEvent(null)
  }

  function closeSmartAdd(){
    setSmartAddOpen(false)
  }

  function onEventCreated(ev){
    // refresh events after creation or edit
    loadEvents()
    setModalEvent(null)
    setModalOpen(false)
  }

  function onEventDeleted(id){
    loadEvents()
    setModalEvent(null)
    setModalOpen(false)
  }

  function goPrevious(){
    setVisibleDate((current) => {
      if (viewMode === 'week') {
        return new Date(current.getFullYear(), current.getMonth(), current.getDate() - 7)
      }
      return new Date(current.getFullYear(), current.getMonth() - 1, 1)
    })
  }

  function goNext(){
    setVisibleDate((current) => {
      if (viewMode === 'week') {
        return new Date(current.getFullYear(), current.getMonth(), current.getDate() + 7)
      }
      return new Date(current.getFullYear(), current.getMonth() + 1, 1)
    })
  }

  function goToday(){
    const today = new Date()
    setVisibleDate(today)
    setSelectedDate(today)
  }

  function onSelectDay(date){
    setSelectedDate(date)
    setSelectedEventId(null)
    if (viewMode === 'week') {
      setVisibleDate(date)
    }
  }

  function onOpenEvent(ev){
    setSelectedEventId(ev.id)
    // also set selected date to the event date
    const eventDate = new Date(ev.start_datetime)
    setSelectedDate(eventDate)
    setVisibleDate(eventDate)
    // open modal for viewing/editing
    setModalOpen(true)
    setModalEvent(ev)
  }

  function onHighlightEvent(ev){
    setSelectedEventId(ev.id)
    const eventDate = new Date(ev.start_datetime)
    setSelectedDate(eventDate)
    setVisibleDate(eventDate)
  }

  const [modalEvent, setModalEvent] = useState(null)

  useEffect(() => {
    function onKeyDown(event) {
      const target = event.target
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) {
        return
      }

      const key = event.key
      if (key.toUpperCase() === keyboardShortcuts.openManualEvent) {
        event.preventDefault()
        openManualEvent()
      }

      if (key.toUpperCase() === keyboardShortcuts.jumpToToday) {
        event.preventDefault()
        goToday()
      }

      if (key === keyboardShortcuts.previousPeriod) {
        event.preventDefault()
        goPrevious()
      }

      if (key === keyboardShortcuts.nextPeriod) {
        event.preventDefault()
        goNext()
      }

      if (key === keyboardShortcuts.closeModal) {
        if (modalOpen) {
          closeModal()
        }
        if (smartAddOpen) {
          closeSmartAdd()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [modalOpen, smartAddOpen, viewMode])

  return (
    <div className="app-root">
      <TopNav />
      {error && <div className="banner">{uiText.backendOffline}</div>}
      <main className="main-grid">
        <section className="calendar-area">
          <div className="calendar-header">
            <h2>{uiText.appTitle}</h2>
            <div className="header-actions">
              <button className="quick-add" onClick={openManualEvent}>+ {uiText.manualEvent}</button>
              <button className="smart-add" onClick={openSmartAdd}>{uiText.smartAdd}</button>
            </div>
          </div>
          <Calendar
            events={events}
            loading={loading}
            selectedDate={selectedDate}
            visibleDate={visibleDate}
            viewMode={viewMode}
            onSelectDay={onSelectDay}
            onHighlightEvent={onHighlightEvent}
            onOpenEvent={onOpenEvent}
            onChangeVisibleDate={setVisibleDate}
            onChangeViewMode={setViewMode}
            onNavigatePrev={goPrevious}
            onNavigateNext={goNext}
            onGoToday={goToday}
            selectedEventId={selectedEventId}
          />
        </section>

        <aside className="today-area">
          <TodayPanel
            events={events}
            loading={loading}
            selectedDate={selectedDate}
            selectedEventId={selectedEventId}
            onHighlightEvent={onHighlightEvent}
            onOpenEvent={onOpenEvent}
          />
        </aside>
      </main>

      <CommandBar />

      <CreateEventModal open={modalOpen} onClose={closeModal} onCreated={onEventCreated} onDeleted={onEventDeleted} defaultDate={selectedDate} event={modalEvent} />
      <SmartAddModal open={smartAddOpen} onClose={closeSmartAdd} />
    </div>
  )
}
