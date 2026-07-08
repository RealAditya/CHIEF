import React from 'react'

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
}

export default function TodayPanel({ events = [], loading = false, selectedDate, selectedEventId, onSelectEvent }){
  const dayKey = selectedDate ? `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}` : null
  const todays = events.filter(ev => {
    if (!ev.start_datetime) return false
    const d = new Date(ev.start_datetime)
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` === dayKey
  })

  const heading = selectedDate ? selectedDate.toLocaleDateString(undefined, {weekday:'long', month:'short', day:'numeric'}) : 'Selected Day'

  return (
    <div className="today-panel">
      <h3>{heading}</h3>
      <div className="today-list">
        {loading && <div className="loading">Loading events...</div>}
        {!loading && todays.length === 0 && <div className="empty">No events for this day.</div>}
        {!loading && todays.map(ev => (
          <div className={`today-item ${selectedEventId === ev.id ? 'selected' : ''}`} key={ev.id} onClick={()=>onSelectEvent && onSelectEvent(ev)} role="button" tabIndex={0} onKeyDown={(e)=>{ if (e.key==='Enter') onSelectEvent && onSelectEvent(ev) }}>
            <div className="time">{formatTime(ev.start_datetime)}</div>
            <div className="title">{ev.title}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
