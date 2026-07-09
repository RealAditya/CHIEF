import React from 'react'
import uiText from '../config/uiText'

export default function SmartAddModal({ open, onClose }) {
  if (!open) return null

  return (
    <div className="modal-overlay centered" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-label={uiText.smartAddTitle}>
        <div className="modal-form">
          <h2 className="modal-title">{uiText.smartAddTitle}</h2>
          <p>{uiText.smartAddMessage}</p>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>{uiText.buttonCancel}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
