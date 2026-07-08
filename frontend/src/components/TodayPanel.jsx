import React from 'react'

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
}

export default function TodayPanel({ events = [], loading = false }){
  const today = new Date()
  const key = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
  const todays = events.filter(ev => {
    if (!ev.start_datetime) return false
    const d = new Date(ev.start_datetime)
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` === key
  })

  return (
    <div className="today-panel">
      <h3>Today</h3>
      <div className="today-list">
        {loading && <div className="loading">Loading…</div>}
        {!loading && todays.length === 0 && <div className="empty">Nothing scheduled today.</div>}
        {!loading && todays.map(ev => (
          <div className="today-item" key={ev.id}>
            <div className="time">{formatTime(ev.start_datetime)}</div>
            <div className="title">{ev.title}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
