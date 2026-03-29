import PanelCard from '../common/PanelCard'
import SectionTitle from '../common/SectionTitle'

export default function StoryNodeTimeline({
  nodes = [],
  activeNodeId,
  onSelect,
}) {
  return (
    <PanelCard>
      <SectionTitle title="节点流" desc="世界线底部时间流 / 故事流" />
      <div className="timeline">
        {nodes.map((node, index) => (
          <div key={node.id} style={{ display: 'flex', alignItems: 'center' }}>
            <div
              className={`timeline-node ${activeNodeId === node.id ? 'active' : ''}`}
              onClick={() => onSelect?.(node)}
              style={{ cursor: 'pointer' }}
            >
              <div className="timeline-node__dot">
                {(node.iconText || node.title || '节').slice(0, 1)}
              </div>
              <div className="list-item__sub">{node.title}</div>
            </div>
            {index < nodes.length - 1 ? <div className="flow-connector" style={{ width: 52 }} /> : null}
          </div>
        ))}
      </div>
    </PanelCard>
  )
}