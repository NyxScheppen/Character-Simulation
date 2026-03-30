import React from 'react'

export default function Modal({
  open,
  title,
  children,
  footer,
  onClose,
}) {
  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-card__header">
          <div className="modal-card__title">{title}</div>
          <button
            type="button"
            className="modal-card__close"
            onClick={onClose}
            aria-label="关闭"
          >
            ×
          </button>
        </div>

        <div className="modal-card__body">
          {children}
        </div>

        {footer ? (
          <div className="modal-card__footer">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}