import React from 'react'

export default function TodayPanel(){
  const events = [
    {time:'09:00', title:'Standup'},
    {time:'11:00', title:'Call with Alex'},
    {time:'15:00', title:'Review PRs'},
  ]
  return (
    <div className="today-panel">
      <h3>Today</h3>
      <div className="today-list">
        {events.map((e, idx)=> (
          <div className="today-item" key={idx}>
            <div className="time">{e.time}</div>
            <div className="title">{e.title}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
