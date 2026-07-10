import React, { useState } from 'react'
import TooltipPortal from './TooltipPortal'
import uiText from '../config/uiText'
import { eventCategoryMap } from '../config/eventCategories'

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
}

export default function TodayPanel({ events = [], loading = false, selectedDate, selectedEventId, onHighlightEvent, onOpenEvent }){
  const dayKey = selectedDate ? `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}` : null
  const todays = events
    .filter(ev => {
      if (!ev.start_datetime) return false
      const d = new Date(ev.start_datetime)
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` === dayKey
    })
    .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime))

  const heading = selectedDate ? selectedDate.toLocaleDateString(undefined, {weekday:'long', month:'short', day:'numeric'}) : uiText.selectedDay
  const isTodaySelected = selectedDate ? (() => {
    const now = new Date()
    return now.getFullYear() === selectedDate.getFullYear() && now.getMonth() === selectedDate.getMonth() && now.getDate() === selectedDate.getDate()
  })() : false

  const TodayRow = ({ev, selected, onHighlightEvent, onOpenEvent}) => {
    const [hoveredRect, setHoveredRect] = useState(null)
    const category = eventCategoryMap[ev.category] ?? eventCategoryMap.other
    return (
      <div className={`today-item ${selected ? 'selected' : ''}`} key={ev.id} onClick={()=>onHighlightEvent && onHighlightEvent(ev)} onDoubleClick={()=>onOpenEvent && onOpenEvent(ev)} role="button" tabIndex={0} onKeyDown={(e)=>{ if (e.key==='Enter') onHighlightEvent && onHighlightEvent(ev) }} onMouseEnter={(e)=>{ const r = e.currentTarget.getBoundingClientRect(); setHoveredRect(r) }} onMouseLeave={()=>setHoveredRect(null)}>
        <div className="time">{formatTime(ev.start_datetime)}</div>
        <div style={{flex:1}}>
          <div className="title">{ev.title}</div>
          <div className="subtitle" style={{display:'flex',gap:'8px',alignItems:'center',color:'var(--text-secondary)',fontSize:13}}>
            <span className="category-indicator" style={{background: category.color}} />
            <span>{category.name}</span>
          </div>
        </div>
        {hoveredRect && (
          <TooltipPortal anchorRect={hoveredRect}>
            <div style={{fontWeight:700,marginBottom:6}}>{ev.title}</div>
            <div style={{color:'var(--text-secondary)',fontSize:13}}>{formatTime(ev.start_datetime)}{ev.end_datetime ? ' • ' + formatTime(ev.end_datetime) : ''}</div>
            {ev.description ? <div style={{marginTop:6,fontSize:13,color:'var(--text-secondary)'}}>{ev.description}</div> : null}
          </TooltipPortal>
        )}
      </div>
    )
  }

  return (
    <div className="today-panel">
      <h3>{heading}</h3>
      <div className="today-list">
        {loading && <div className="loading">{uiText.loadingEvents}</div>}
        {!loading && todays.length === 0 && <div className="empty">{uiText.emptyPlanned}<br />{uiText.emptyEnjoy}</div>}
        {!loading && todays.map(ev => (
          <TodayRow
            key={ev.id}
            ev={ev}
            selected={selectedEventId === ev.id}
            onHighlightEvent={onHighlightEvent}
            onOpenEvent={onOpenEvent}
          />
        ))}
      </div>
    </div>
  )
}
