import React, { useEffect, useRef, useState } from 'react'

const EVENT_TYPES = ['meeting','birthday','task','travel','reminder']
const EVENT_LABELS = {
  meeting: 'Meeting',
  birthday: 'Birthday',
  task: 'Task',
  travel: 'Travel',
  reminder: 'Reminder'
}

export default function CreateEventModal({ open, onClose, onCreated, defaultDate }){
  const titleRef = useRef(null)
  const overlayRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    title: '',
    description: '',
    start_datetime: defaultDate ? new Date(defaultDate).toISOString().slice(0,16) : '',
    end_datetime: '',
    event_type: 'meeting'
  })

  useEffect(() => {
    if (open) {
      // focus title
      setTimeout(() => titleRef.current && titleRef.current.focus(), 0)
      // reset form
      setForm(f => ({...f, start_datetime: defaultDate ? new Date(defaultDate).toISOString().slice(0,16) : '', title: '', description: '', end_datetime: '', event_type: 'meeting'}))
      setErrors({})
    }
  }, [open, defaultDate])

  useEffect(() => {
    function onKey(e){
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function onOverlayClick(e){
    if (e.target === overlayRef.current) onClose()
  }

  function updateField(name, value){
    setForm(f => ({...f, [name]: value}))
    setErrors(err => ({...err, [name]: null}))
  }

  function validate(){
    const err = {}
    if (!form.title || form.title.trim().length < 2) err.title = 'Please provide a title (2+ characters).'
    if (!form.start_datetime) err.start_datetime = 'Start time is required.'
    // optional: if end before start
    if (form.end_datetime && form.start_datetime) {
      const s = new Date(form.start_datetime)
      const e = new Date(form.end_datetime)
      if (e < s) err.end_datetime = 'End must be after start.'
    }
    setErrors(err)
    return Object.keys(err).length === 0
  }

  async function submit(e){
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try{
      const res = await fetch((import.meta.env.VITE_API_URL ?? 'http://localhost:8000') + '/events', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          start_datetime: new Date(form.start_datetime).toISOString(),
          end_datetime: form.end_datetime ? new Date(form.end_datetime).toISOString() : null,
          event_type: form.event_type
        })
      })
      if (res.ok){
        const data = await res.json()
        onCreated && onCreated(data)
        onClose()
      } else {
        // show a general error
        setErrors({__form: 'Failed to create event. Please try again.'})
        console.error('Failed to create event', res.statusText)
      }
    }catch(err){
      setErrors({__form: 'Network error while creating event.'})
      console.error('Error creating event', err)
    }finally{
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="modal-overlay centered" ref={overlayRef} onMouseDown={onOverlayClick}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-label="Create Event">
        <form onSubmit={submit} className="modal-form">
          <h2 className="modal-title">Create Event</h2>

          <div className="form-row">
            <label className="form-label">Title</label>
            <input ref={titleRef} className="form-input" value={form.title} onChange={e=>updateField('title', e.target.value)} aria-invalid={!!errors.title} />
            {errors.title && <div className="field-error">{errors.title}</div>}
          </div>

          <div className="form-row">
            <label className="form-label">Description</label>
            <textarea className="form-input" value={form.description} onChange={e=>updateField('description', e.target.value)} />
            {errors.description && <div className="field-error">{errors.description}</div>}
          </div>

          <div className="form-row split">
            <div className="col">
              <label className="form-label">Start</label>
              <input type="datetime-local" className="form-input" value={form.start_datetime} onChange={e=>updateField('start_datetime', e.target.value)} aria-invalid={!!errors.start_datetime} />
              {errors.start_datetime && <div className="field-error">{errors.start_datetime}</div>}
            </div>

            <div className="col">
              <label className="form-label">End</label>
              <input type="datetime-local" className="form-input" value={form.end_datetime} onChange={e=>updateField('end_datetime', e.target.value)} aria-invalid={!!errors.end_datetime} />
              {errors.end_datetime && <div className="field-error">{errors.end_datetime}</div>}
            </div>
          </div>

          <div className="form-row">
            <label className="form-label">Type</label>
            <div className="chips-row" role="tablist" aria-label="Event type">
              {EVENT_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  className={`chip ${form.event_type === t ? 'chip-selected' : ''}`}
                  onClick={() => updateField('event_type', t)}
                >{EVENT_LABELS[t]}</button>
              ))}
            </div>
            {errors.event_type && <div className="field-error">{errors.event_type}</div>}
          </div>

          {errors.__form && <div className="form-error">{errors.__form}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>Create Event</button>
          </div>
        </form>
      </div>
    </div>
  )
}
