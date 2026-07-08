import React, { useEffect, useRef, useState } from 'react'

export default function CreateEventModal({ open, onClose, onCreated, defaultDate }){
  const titleRef = useRef(null)
  const overlayRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
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
      setForm(f => ({...f, start_datetime: defaultDate ? new Date(defaultDate).toISOString().slice(0,16) : ''}))
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
  }

  async function submit(e){
    e.preventDefault()
    if (!form.title || !form.start_datetime) return
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
        console.error('Failed to create event', res.statusText)
      }
    }catch(err){
      console.error('Error creating event', err)
    }finally{
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="modal-overlay" ref={overlayRef} onMouseDown={onOverlayClick}>
      <div className="modal" role="dialog" aria-modal="true">
        <form onSubmit={submit}>
          <h3>Create Event</h3>
          <label>Title
            <input ref={titleRef} value={form.title} onChange={e=>updateField('title', e.target.value)} required />
          </label>
          <label>Description
            <textarea value={form.description} onChange={e=>updateField('description', e.target.value)} />
          </label>
          <label>Start
            <input type="datetime-local" value={form.start_datetime} onChange={e=>updateField('start_datetime', e.target.value)} required />
          </label>
          <label>End
            <input type="datetime-local" value={form.end_datetime} onChange={e=>updateField('end_datetime', e.target.value)} />
          </label>
          <label>Type
            <select value={form.event_type} onChange={e=>updateField('event_type', e.target.value)}>
              <option value="meeting">Meeting</option>
              <option value="birthday">Birthday</option>
              <option value="reminder">Reminder</option>
              <option value="personal">Personal</option>
            </select>
          </label>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>Create</button>
          </div>
        </form>
      </div>
    </div>
  )
}
