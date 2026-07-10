import React, { useState } from 'react'
import uiText from '../config/uiText'

export default function SmartAddModal({ open, onClose, onCreate }) {
  if (!open) return null

  const [text, setText] = useState('')
  const [parsed, setParsed] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

  async function doParse() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/parse`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) })
      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        throw new Error(txt || 'Parse failed')
      }
      const data = await res.json()
      setParsed(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function confirmCreate() {
    if (!parsed) return
    // allow user to edit fields inline — parsed is used directly
    try {
      const payload = {
        title: parsed.title || 'Untitled',
        description: parsed.description || null,
        start_datetime: parsed.start_datetime,
        end_datetime: parsed.end_datetime,
        event_type: 'manual',
        category: parsed.category || 'other',
        priority: parsed.priority || 'normal',
      }
      const res = await fetch(`${API_BASE}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        throw new Error(txt || 'Create failed')
      }
      const created = await res.json()
      if (onCreate) onCreate(created)
      onClose()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="modal-overlay centered" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-label={uiText.smartAddTitle}>
        <div className="modal-form">
          <h2 className="modal-title">{uiText.smartAddTitle}</h2>
          <p>{uiText.smartAddMessage}</p>

          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Tomorrow 5pm team sync" rows={3} />

          <div style={{ marginTop: 8 }}>
            <button className="btn-primary" onClick={doParse} disabled={loading || !text}>{loading ? 'Parsing...' : 'Parse'}</button>
            <button className="btn-secondary" onClick={onClose} style={{ marginLeft: 8 }}>{uiText.buttonCancel}</button>
          </div>

          {error && <div className="form-error">{error}</div>}

          {parsed && (
            <div className="parsed-preview" style={{ marginTop: 12 }}>
              {parsed.warnings && parsed.warnings.length > 0 && (
                <div className="warning">Parsing warnings: {parsed.warnings.join(', ')}</div>
              )}
              <label>Title</label>
              <input value={parsed.title || ''} onChange={(e) => setParsed({ ...parsed, title: e.target.value })} />

              <label>Start</label>
              <input value={parsed.start_datetime || ''} onChange={(e) => setParsed({ ...parsed, start_datetime: e.target.value })} />

              <label>End</label>
              <input value={parsed.end_datetime || ''} onChange={(e) => setParsed({ ...parsed, end_datetime: e.target.value })} />

              <label>Category</label>
              <input value={parsed.category || ''} onChange={(e) => setParsed({ ...parsed, category: e.target.value })} />

              <div style={{ marginTop: 8 }}>
                <button className="btn-primary" onClick={confirmCreate}>{uiText.buttonCreate}</button>
                <button className="btn-secondary" onClick={() => setParsed(null)} style={{ marginLeft: 8 }}>{uiText.buttonCancel}</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
