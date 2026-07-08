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

export default function Calendar({ events = [], loading = false }) {
  const weeks = generateMonthMatrix()
  const now = new Date()
  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`
  const byDay = eventsByDay(events)

  const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const monthName = now.toLocaleString(undefined, { month: 'long', year: 'numeric' })

  return (
    <div className="calendar">
      <div className="month-title">{monthName}</div>

      <div className="weekdays">
        {weekdays.map((w) => (
          <div key={w} className="weekday">{w}</div>
        ))}
      </div>

      <div className="weeks">
        {weeks.map((week, idx) => (
          <div className="week" key={idx}>
            {week.map((day, i) => {
              const key = day ? `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}` : null
              const dayEvents = key && byDay[key] ? byDay[key] : []
              const isToday = key === todayKey
              return (
                <div className={`day ${isToday ? 'today' : ''}`} key={i}>
                  {day ? <div className="date">{day.getDate()}</div> : null}

                  {day && (
                    <div className="day-events">
                      {dayEvents.slice(0, 3).map(ev => (
                        <div key={ev.id} className={`event-chip ${ev.event_type || 'meeting'}`}>{ev.title}</div>
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
