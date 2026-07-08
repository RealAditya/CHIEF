import React from 'react'
import TopNav from './components/TopNav'
import Calendar from './components/Calendar'
import TodayPanel from './components/TodayPanel'
import CommandBar from './components/CommandBar'

export default function App() {
  return (
    <div className="app-root">
      <TopNav />
      <main className="main-grid">
        <section className="calendar-area">
          <div className="calendar-header">
            <h2>Monthly Calendar</h2>
            <button className="quick-add">+ Quick Add</button>
          </div>
          <Calendar />
        </section>

        <aside className="today-area">
          <TodayPanel />
        </aside>
      </main>

      <CommandBar />
    </div>
  )
}
