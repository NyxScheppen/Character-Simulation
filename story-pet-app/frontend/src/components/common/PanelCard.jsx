export default function PanelCard({ children, strong = false, className = '' }) {
  return (
    <section className={`panel-card ${strong ? 'panel-card--strong' : ''} ${className}`}>
      <div className="panel-card__inner">{children}</div>
    </section>
  )
}