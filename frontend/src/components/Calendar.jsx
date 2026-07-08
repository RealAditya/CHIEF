import React from 'react'

function generateMonthMatrix(date = new Date()) {
  const year = date.getFullYear()
  const month = date.getMonth()

  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)

  const startDay = first.getDay()
  const daysInMonth = last.getDate()

  const weeks = []
  let week = new Array(7).fill(null)
  let day = 1

  for (let i = startDay; i < 7; i++) week[i] = new Date(year, month, day++)
  weeks.push(week)

  while (day <= daysInMonth) {
    week = new Array(7).fill(null)
    for (let i = 0; i < 7 && day <= daysInMonth; i++) {
      week[i] = new Date(year, month, day++)
    }
    weeks.push(week)
  }

  while (weeks.length < 6) weeks.push(new Array(7).fill(null))
  return weeks
}

function eventsByDay(events) {
  const map = {}
  events.forEach(ev => {
    if (!ev.start_datetime) return
    const d = new Date(ev.start_datetime)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    map[key] = map[key] || []
    map[key].push(ev)
  })
  return map
}

export default function Calendar({ events = [], loading = false, selectedDate, onSelectDay, onSelectEvent, selectedEventId }) {
  const weeks = generateMonthMatrix()
  const now = new Date()
  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`
  const byDay = eventsByDay(events)

  const monthName = now.toLocaleString(undefined, { month: 'long', year: 'numeric' })

  function toKey(d) {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
  }

  const selectedKey = selectedDate ? toKey(selectedDate) : null

  return (
    <div className="calendar">
      <div className="month-title">{monthName}</div>

      <div className="weekdays">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((w) => (
          <div key={w} className="weekday">{w}</div>
        ))}
      </div>

      <div className="weeks">
        {weeks.map((week, wi) => (
          <div className="week" key={wi}>
            {week.map((day, di) => {
              const key = day ? toKey(day) : null
              const dayEvents = key && byDay[key] ? byDay[key] : []
              const isToday = key === todayKey
              const isSelected = key && selectedKey === key
              return (
                <div
                  key={di}
                  className={`day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => day && onSelectDay && onSelectDay(day)}
                  role={day ? 'button' : undefined}
                  tabIndex={day ? 0 : -1}
                  onKeyDown={(e) => { if (e.key === 'Enter') day && onSelectDay && onSelectDay(day) }}
                >
                  {day ? <div className="date">{day.getDate()}</div> : null}

                  {day && (
                    <div className="day-events">
                      {dayEvents.slice(0, 3).map(ev => (
                        <div
                          key={ev.id}
                          className={`event-chip ${ev.event_type || 'meeting'} ${selectedEventId === ev.id ? 'highlight' : ''}`}
                          onClick={(e)=>{ e.stopPropagation(); onSelectEvent && onSelectEvent(ev) }}
                          title={ev.title}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e)=>{ if (e.key === 'Enter') { e.stopPropagation(); onSelectEvent && onSelectEvent(ev) } }}
                        >{ev.title}</div>
                      ))}
                      {dayEvents.length > 3 && <div className="more-events">+{dayEvents.length - 3}</div>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {loading && <div className="loading-overlay">Loading events...</div>}
    </div>
  )
}
