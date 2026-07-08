import React, { useEffect, useState } from 'react'
import TopNav from './components/TopNav'
import Calendar from './components/Calendar'
import TodayPanel from './components/TodayPanel'
import CommandBar from './components/CommandBar'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export default function App() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/events`)
        if (res.ok) {
          const data = await res.json()
          setEvents(data)
        } else {
          console.error('Failed to load events', res.statusText)
        }
      } catch (err) {
        console.error('Error fetching events', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="app-root">
      <TopNav />
      <main className="main-grid">
        <section className="calendar-area">
          <div className="calendar-header">
            <h2>Monthly Calendar</h2>
            <button className="quick-add">+ Quick Add</button>
          </div>
          <Calendar events={events} loading={loading} />
        </section>

        <aside className="today-area">
          <TodayPanel events={events} loading={loading} />
        </aside>
      </main>

      <CommandBar />
    </div>
  )
}
