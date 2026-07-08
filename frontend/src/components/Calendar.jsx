import React from 'react'

function generateMonth(year, month) {
  // month: 0-11
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const days = []
  // push empty slots until first weekday
  const startWeekday = first.getDay() // 0=Sun
  for (let i = 0; i < startWeekday; i++) days.push(null)
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d))
  // pad to full weeks
  while (days.length % 7 !== 0) days.push(null)
  return days
}

const EVENT_TYPES = ['meeting','birthday','reminder','personal']
const EVENT_LABELS = {
  meeting: 'Meeting',
  birthday: 'Birthday',
  reminder: 'Reminder',
  personal: 'Personal'
}

export default function Calendar(){
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const monthDays = generateMonth(year, month)
  const weeks = []
  for (let i = 0; i < monthDays.length; i += 7) weeks.push(monthDays.slice(i, i+7))

  const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const monthName = now.toLocaleString(undefined, {month: 'long', year: 'numeric'})

  return (
    <div className="calendar">
      <div className="month-title">{monthName}</div>
      <div className="weekdays">
        {weekdays.map((w)=> <div key={w} className="weekday">{w}</div>)}
      </div>
      <div className="weeks">
        {weeks.map((week, idx) => (
          <div className="week" key={idx}>
            {week.map((day, i) => {
              const isToday = day && day.getDate()===now.getDate()
              // choose a placeholder event type based on date to show color variety
              let eventType = null
              if (day) {
                eventType = EVENT_TYPES[day.getDate() % EVENT_TYPES.length]
              }
              return (
                <div className={`day ${isToday ? 'today' : ''}`} key={i}>
                  {day ? <div className="date">{day.getDate()}</div> : null}
                  {day ? <div className={`placeholder-event ${eventType}`}>{EVENT_LABELS[eventType]}</div> : null}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
