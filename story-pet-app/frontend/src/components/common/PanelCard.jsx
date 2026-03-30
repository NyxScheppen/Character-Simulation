import React from 'react'

export default function PanelCard({
  children,
  className = '',
  strong = false,
}) {
  return (
    <div className={`panel-card ${strong ? 'panel-card--strong' : ''} ${className}`.trim()}>
      <div className="panel-card__inner">
        {children}
      </div>
    </div>
  )
}