import PanelCard from '../common/PanelCard'
import SectionTitle from '../common/SectionTitle'
import IconBadge from '../common/IconBadge'

export default function WorldlineList({
  worldlines = [],
  activeId,
  onSelect,
}) {
  return (
    <PanelCard>
      <SectionTitle title="世界线列表" desc="右侧分支导航" />
      <div className="list-stack">
        {worldlines.map((item) => (
          <div
            key={item.id}
            className={`list-item ${activeId === item.id ? 'active' : ''}`}
          >
            <div className="list-item__main" onClick={() => onSelect?.(item)}>
              <IconBadge text={item.iconText || '线'} tone={item.tone || 'violet'} />
              <div>
                <div className="list-item__title">{item.name}</div>
                <div className="list-item__sub">{item.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PanelCard>
  )
}