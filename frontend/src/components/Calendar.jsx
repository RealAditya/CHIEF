import React, { useEffect, useMemo, useRef, useState } from 'react'
import TooltipPortal from './TooltipPortal'
import uiText from '../config/uiText'
import { eventCategoryMap } from '../config/eventCategories'
import colors from '../config/colors'
import theme from '../config/theme'

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
const weekdayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function toKey(d) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function generateMonthMatrix(date) {
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

function generateWeekMatrix(date) {
  const start = new Date(date)
  const offset = start.getDay()
  start.setDate(start.getDate() - offset)
  const week = []
  for (let i = 0; i < 7; i++) {
    week.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
  }
  return [week]
}

function eventsByDay(events) {
  const map = {}
  events.forEach(ev => {
    if (!ev.start_datetime) return
    const d = new Date(ev.start_datetime)
    const key = toKey(d)
    map[key] = map[key] || []
    map[key].push(ev)
  })
  return map
}

export default function Calendar({
  events = [],
  loading = false,
  selectedDate,
  visibleDate = new Date(),
  viewMode = 'month',
  onSelectDay,
  onHighlightEvent,
  onOpenEvent,
  onChangeVisibleDate,
  onChangeViewMode,
  onNavigatePrev,
  onNavigateNext,
  onGoToday,
  selectedEventId,
}) {
  const [picker, setPicker] = useState(null)
  const [morePopover, setMorePopover] = useState(null)
  const [hovered, setHovered] = useState(null)
  const popoverRef = useRef(null)

  const referenceDate = visibleDate || new Date()
  const weeks = viewMode === 'week' ? generateWeekMatrix(referenceDate) : generateMonthMatrix(referenceDate)
  const now = new Date()
  const todayKey = toKey(now)
  const byDay = useMemo(() => eventsByDay(events), [events])
  const selectedKey = selectedDate ? toKey(selectedDate) : null
  const currentLabel = `${monthNames[referenceDate.getMonth()]} ${referenceDate.getFullYear()}`
  const yearOptions = Array.from({ length: 9 }, (_, i) => referenceDate.getFullYear() - 4 + i)
  const isPickerOpen = Boolean(picker)

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!isPickerOpen && !morePopover) return
      const target = event.target
      if (popoverRef.current && popoverRef.current.contains(target)) return
      setPicker(null)
      setMorePopover(null)
    }

    window.addEventListener('mousedown', handleOutsideClick)
    return () => window.removeEventListener('mousedown', handleOutsideClick)
  }, [isPickerOpen, morePopover])

  function openMonthPicker() {
    setPicker(picker === 'month' ? null : 'month')
  }

  function openYearPicker() {
    setPicker(picker === 'year' ? null : 'year')
  }

  function selectMonth(monthIndex) {
    onChangeVisibleDate(new Date(referenceDate.getFullYear(), monthIndex, 1))
    setPicker(null)
  }

  function selectYear(year) {
    onChangeVisibleDate(new Date(year, referenceDate.getMonth(), 1))
    setPicker(null)
  }

  function openMore(dayKey, eventsForDay, anchorRect) {
    setMorePopover({ dayKey, events: eventsForDay, anchorRect })
  }

  function renderEventChip(ev) {
    const start = ev.start_datetime ? new Date(ev.start_datetime) : null
    const timeStr = start ? formatTime(start) : ''
    const category = eventCategoryMap[ev.category] ?? eventCategoryMap.other
    const chipBackground = `${category.color}22`
    return (
      <div
        key={ev.id}
        className={`event-chip ${selectedEventId === ev.id ? 'highlight' : ''}`}
        style={{ borderLeftColor: category.color, background: chipBackground, transition: theme.transition }}
        onClick={(e) => { e.stopPropagation(); onHighlightEvent && onHighlightEvent(ev) }}
        onDoubleClick={(e) => { e.stopPropagation(); onOpenEvent && onOpenEvent(ev) }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onHighlightEvent && onHighlightEvent(ev) } }}
        onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setHovered({ id: ev.id, rect }) }}
        onMouseLeave={() => setHovered((current) => (current && current.id === ev.id ? null : current))}
      >
        <div className="event-chip-time">{timeStr}</div>
        <div className="event-chip-title">{ev.title}</div>
      </div>
    )
  }

  const hoveredEvent = hovered ? events.find((ev) => ev.id === hovered.id) : null

  return (
    <div className="calendar">
      <div className="calendar-controls">
        <div className="calendar-navigation">
          <button type="button" className="nav-button" onClick={onNavigatePrev} aria-label={uiText.previousMonth}>‹</button>
          <button type="button" className="today-button" onClick={onGoToday}>{uiText.today}</button>
          <button type="button" className="nav-button" onClick={onNavigateNext} aria-label={uiText.nextMonth}>›</button>
        </div>

        <div className="calendar-title" aria-label={currentLabel}>
          <button type="button" className="calendar-title-item" onClick={openMonthPicker}>{monthNames[referenceDate.getMonth()]}</button>
          <button type="button" className="calendar-title-item" onClick={openYearPicker}>{referenceDate.getFullYear()}</button>
        </div>

        <div className="calendar-view-toggle">
          <button className={`toggle-button ${viewMode === 'month' ? 'active' : ''}`} type="button" onClick={() => onChangeViewMode('month')}>{uiText.monthView}</button>
          <button className={`toggle-button ${viewMode === 'week' ? 'active' : ''}`} type="button" onClick={() => onChangeViewMode('week')}>{uiText.weekView}</button>
        </div>
      </div>

      {picker === 'month' && (
        <div className="picker-panel" ref={popoverRef} aria-label={uiText.monthPickerTitle}>
          <div className="picker-title">{uiText.monthPickerTitle}</div>
          <div className="picker-grid">
            {monthNames.map((month, index) => (
              <button key={month} type="button" className="picker-option" onClick={() => selectMonth(index)}>{month}</button>
            ))}
          </div>
        </div>
      )}

      {picker === 'year' && (
        <div className="picker-panel" ref={popoverRef} aria-label={uiText.yearPickerTitle}>
          <div className="picker-title">{uiText.yearPickerTitle}</div>
          <div className="picker-grid year-grid">
            {yearOptions.map((year) => (
              <button key={year} type="button" className="picker-option" onClick={() => selectYear(year)}>{year}</button>
            ))}
          </div>
        </div>
      )}

      <div className="weekdays">
        {weekdayNames.map((w) => (
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
              const isWeekend = day && (day.getDay() === 0 || day.getDay() === 6)
              return (
                <div
                  key={di}
                  className={`day ${day ? '' : 'empty'} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isWeekend ? 'weekend' : ''}`}
                  style={isWeekend ? { background: colors.weekendBackground, borderColor: colors.weekendBorder } : undefined}
                  onClick={() => day && onSelectDay && onSelectDay(day)}
                  role={day ? 'button' : undefined}
                  tabIndex={day ? 0 : -1}
                  onKeyDown={(e) => { if (e.key === 'Enter') day && onSelectDay && onSelectDay(day) }}
                >
                  {day ? <div className="date">{day.getDate()}</div> : null}

                  {day && (
                    <div className="day-events">
                      {dayEvents.slice().sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime)).slice(0, 3).map(renderEventChip)}
                      {dayEvents.length > 3 && (
                        <button
                          type="button"
                          className="more-events"
                          onClick={(e) => {
                            e.stopPropagation()
                            openMore(key, dayEvents.slice(3), e.currentTarget.getBoundingClientRect())
                          }}
                        >
                          +{dayEvents.length - 3} more
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {loading && <div className="loading-overlay">{uiText.loadingEvents}</div>}

      {hoveredEvent && hovered && (
        <TooltipPortal anchorRect={hovered.rect}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>{hoveredEvent.title}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 6 }}>
            {eventCategoryMap[hoveredEvent.category]?.name ?? 'Other'} · {formatTime(hoveredEvent.start_datetime)}{hoveredEvent.end_datetime ? ' • ' + formatTime(hoveredEvent.end_datetime) : ''}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 6 }}>{uiText.labelPriority}: {hoveredEvent.priority}</div>
          {hoveredEvent.description ? <div style={{ marginTop: 0, fontSize: 13, color: 'var(--text-secondary)' }}>{hoveredEvent.description}</div> : null}
          <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-secondary)' }}>{uiText.labelCreatedAt}: {new Date(hoveredEvent.created_at).toLocaleString()}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{uiText.labelUpdatedAt}: {new Date(hoveredEvent.updated_at).toLocaleString()}</div>
        </TooltipPortal>
      )}

      {morePopover && (
        <TooltipPortal anchorRect={morePopover.anchorRect}>
          <div ref={popoverRef} className="more-popover">
            <div className="more-popover-title">{uiText.moreEvents.replace('{count}', morePopover.events.length)}</div>
            <div className="more-popover-list">
              {morePopover.events.map((ev) => {
                const start = ev.start_datetime ? new Date(ev.start_datetime) : null
                const timeStr = start ? formatTime(start) : ''
                const category = eventCategoryMap[ev.category] ?? eventCategoryMap.other
                return (
                  <button
                    key={ev.id}
                    type="button"
                    className="more-popover-item"
                    onClick={() => {
                      onHighlightEvent && onHighlightEvent(ev)
                      onOpenEvent && onOpenEvent(ev)
                      setMorePopover(null)
                    }}
                  >
                    <div className="more-popover-time">{timeStr}</div>
                    <div className="more-popover-description">
                      <span className="event-category-dot" style={{ background: category.color }} />
                      <span>{ev.title}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </TooltipPortal>
      )}
    </div>
  )
}
