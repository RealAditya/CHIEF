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

// Always produce a full 6x7 grid including previous/next month days
function generateMonthMatrix(date) {
  const year = date.getFullYear()
  const month = date.getMonth()

  // start from the Sunday of the week that contains the 1st
  const start = new Date(year, month, 1)
  start.setDate(start.getDate() - start.getDay())

  const weeks = []
  let day = new Date(start)

  for (let w = 0; w < 6; w++) {
    const week = []
    for (let d = 0; d < 7; d++) {
      week.push(new Date(day.getFullYear(), day.getMonth(), day.getDate()))
      day.setDate(day.getDate() + 1)
    }
    weeks.push(week)
  }

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

  const weeksRef = useRef(null)
  const [visibleCount, setVisibleCount] = useState(3)

  useEffect(() => {
    // Measure weeks container and calculate how many event chips fit per day cell
    function calculate() {
      if (!weeksRef.current) return
      const totalHeight = weeksRef.current.clientHeight || 0
      const cellHeight = Math.floor(totalHeight / 6)
      const DATE_HEADER_HEIGHT = 24 // slightly reduced header
      const CHIP_HEIGHT = 30 // reduced chip height to compact layout
      const CHIP_GAP = 6 // smaller vertical gap between chips
      const available = Math.max(0, cellHeight - DATE_HEADER_HEIGHT - 10) // padding
      const count = Math.max(0, Math.floor((available + CHIP_GAP) / (CHIP_HEIGHT + CHIP_GAP)))
      setVisibleCount(count)
    }

    calculate()
    // debounce resize to avoid thrash
    let raf = null
    function onResize(){ if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(calculate) }
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('resize', onResize); if (raf) cancelAnimationFrame(raf) }
  }, [viewMode])

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

      <div className="weeks" ref={weeksRef}>
        {weeks.map((week, wi) => (
          <div className="week" key={wi}>
            {week.map((day, di) => {
              const key = day ? toKey(day) : null
              const dayEvents = key && byDay[key] ? byDay[key].slice().sort((a, b) => {
                const tA = a.start_datetime ? new Date(a.start_datetime).getTime() : 0
                const tB = b.start_datetime ? new Date(b.start_datetime).getTime() : 0
                if (tA !== tB) return tA - tB
                const pA = (a.priority != null) ? a.priority : 0
                const pB = (b.priority != null) ? b.priority : 0
                if (pA !== pB) return pB - pA // higher priority first
                return (a.title || '').localeCompare(b.title || '')
              }) : []
              const isToday = key === todayKey
              const isSelected = key && selectedKey === key
              const isWeekend = day && (day.getDay() === 0 || day.getDay() === 6)
              const outsideMonth = day && day.getMonth() !== referenceDate.getMonth()
              const visible = visibleCount > 0 ? dayEvents.slice(0, visibleCount) : []
              const hidden = dayEvents.length > visible.length ? dayEvents.slice(visible.length) : []

              return (
                <div
                  key={di}
                  className={`day ${day ? '' : 'empty'} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isWeekend ? 'weekend' : ''} ${outsideMonth ? 'outside-month' : ''}`}
                  style={isWeekend ? { background: colors.weekendBackground, borderColor: colors.weekendBorder } : undefined}
                  onClick={() => day && onSelectDay && onSelectDay(day)}
                  role={day ? 'button' : undefined}
                  tabIndex={day ? 0 : -1}
                  onKeyDown={(e) => { if (e.key === 'Enter') day && onSelectDay && onSelectDay(day) }}
                >
                  {day ? <div className="date">{day.getDate()}</div> : null}

                  {day && (
                    <div className="day-events">
                      {visible.map(renderEventChip)}

                      {hidden.length > 0 && (
                        <button
                          type="button"
                          className="more-events"
                          onClick={(e) => {
                            e.stopPropagation()
                            openMore(key, hidden, e.currentTarget.getBoundingClientRect())
                          }}
                        >
                          <span className="more-dots">• • •</span>
                          <span style={{marginLeft:8}}>+{hidden.length} more</span>
                          <span style={{marginLeft:8, display:'inline-flex', gap:6}}>
                            {hidden.slice(0,5).map(h => (
                              <span key={h.id} className="more-dot" style={{background: (eventCategoryMap[h.category] ?? eventCategoryMap.other).color}} />
                            ))}
                          </span>
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
