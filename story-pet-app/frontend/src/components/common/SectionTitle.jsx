import React from 'react'

export default function SectionTitle({
  title,
  desc,
  extra,
}) {
  return (
    <div className="section-title">
      <div>
        <h3>{title}</h3>
        {desc ? <div className="section-title__desc">{desc}</div> : null}
      </div>
      {extra ? <div className="section-title__extra">{extra}</div> : null}
    </div>
  )
}