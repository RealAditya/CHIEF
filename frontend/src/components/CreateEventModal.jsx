import React, { useEffect, useRef, useState } from 'react'
import uiText from '../config/uiText'

const EVENT_TYPES = ['meeting','birthday','task','travel','reminder']
const EVENT_LABELS = {
  meeting: 'Meeting',
  birthday: 'Birthday',
  task: 'Task',
  travel: 'Travel',
  reminder: 'Reminder'
}

export default function CreateEventModal({ open, onClose, onCreated, defaultDate, event = null, onDeleted }){
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (open) {
      // focus title
      setTimeout(() => titleRef.current && titleRef.current.focus(), 0)
      // reset or populate form
      if (event) {
        setForm({
          title: event.title || '',
          description: event.description || '',
          start_datetime: event.start_datetime ? event.start_datetime.slice(0,16) : (defaultDate ? new Date(defaultDate).toISOString().slice(0,16) : ''),
          end_datetime: event.end_datetime ? event.end_datetime.slice(0,16) : '',
          event_type: event.event_type || 'meeting'
        })
      } else {
        setForm({title: '', description: '', start_datetime: defaultDate ? new Date(defaultDate).toISOString().slice(0,16) : '', end_datetime: '', event_type: 'meeting'})
      }
      setErrors({})
    }
  }, [open, defaultDate, event])

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
      const urlBase = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000') + '/events'
      let res
      if (event && event.id) {
        // edit existing
        res = await fetch(`${urlBase}/${event.id}`, {
          method: 'PUT',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({
            title: form.title,
            description: form.description,
            start_datetime: new Date(form.start_datetime).toISOString(),
            end_datetime: form.end_datetime ? new Date(form.end_datetime).toISOString() : null,
            event_type: form.event_type
          })
        })
      } else {
        // create new
        res = await fetch(urlBase, {
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
      }

      if (res.ok){
        // For POST/PUT endpoints
        let data = null
        try{ data = await res.json() } catch(e){ /* ignore if no json */ }
        onCreated && onCreated(data)
        onClose()
      } else {
        setErrors({__form: 'Failed to save event. Please try again.'})
        console.error('Failed to save event', res.statusText)
      }
    }catch(err){
      setErrors({__form: 'Network error while saving event.'})
      console.error('Error saving event', err)
    }finally{
      setSubmitting(false)
    }
  }

  async function confirmDelete(){
    if (!event || !event.id) return
    try{
      const url = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000') + `/events/${event.id}`
      const res = await fetch(url, { method: 'DELETE' })
      if (res.ok){
        onDeleted && onDeleted(event.id)
        setShowDeleteConfirm(false)
        onClose()
      } else {
        setErrors({__form: 'Failed to delete event.'})
      }
    }catch(err){
      setErrors({__form: 'Network error while deleting event.'})
      console.error('Error deleting event', err)
    }
  }

  if (!open) return null

  return (
    <div className="modal-overlay centered" ref={overlayRef} onMouseDown={onOverlayClick}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-label={event ? uiText.modalTitleEdit : uiText.modalTitleCreate}>
        <form onSubmit={submit} className="modal-form">
          <h2 className="modal-title">{event ? uiText.modalTitleEdit : uiText.modalTitleCreate}</h2>

          <div className="form-row">
            <label className="form-label">{uiText.labelTitle}</label>
            <input ref={titleRef} className="form-input" value={form.title} onChange={e=>updateField('title', e.target.value)} aria-invalid={!!errors.title} />
            {errors.title && <div className="field-error">{errors.title}</div>}
          </div>

          <div className="form-row">
            <label className="form-label">{uiText.labelDescription}</label>
            <textarea className="form-input" value={form.description} onChange={e=>updateField('description', e.target.value)} />
            {errors.description && <div className="field-error">{errors.description}</div>}
          </div>

          <div className="form-row split">
            <div className="col">
              <label className="form-label">{uiText.labelStart}</label>
              <input type="datetime-local" className="form-input" value={form.start_datetime} onChange={e=>updateField('start_datetime', e.target.value)} aria-invalid={!!errors.start_datetime} />
              {errors.start_datetime && <div className="field-error">{errors.start_datetime}</div>}
            </div>

            <div className="col">
              <label className="form-label">{uiText.labelEnd}</label>
              <input type="datetime-local" className="form-input" value={form.end_datetime} onChange={e=>updateField('end_datetime', e.target.value)} aria-invalid={!!errors.end_datetime} />
              {errors.end_datetime && <div className="field-error">{errors.end_datetime}</div>}
            </div>
          </div>

          <div className="form-row">
            <label className="form-label">{uiText.labelType}</label>
            <div className="chips-row" role="tablist" aria-label={uiText.eventTypeAria}>
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
            <button type="button" className="btn-secondary" onClick={onClose}>{uiText.buttonCancel}</button>
            {event && event.id ? (
              <button type="button" className="btn-secondary btn-danger" onClick={() => setShowDeleteConfirm(true)}>{uiText.buttonDelete}</button>
            ) : null}
            <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving...' : (event ? uiText.buttonSave : uiText.buttonCreate)}</button>
          </div>
        </form>

        {showDeleteConfirm && (
          <div className="confirm-backdrop">
            <div className="confirm-modal">
              <h3>{uiText.deleteConfirmTitle}</h3>
              <p>{uiText.deleteConfirmMessage}</p>
              <div style={{display:'flex',justifyContent:'flex-end',gap:12}}>
                <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)}>{uiText.deleteConfirmCancel}</button>
                <button className="btn-primary btn-danger" onClick={confirmDelete}>{uiText.deleteConfirmAction}</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
