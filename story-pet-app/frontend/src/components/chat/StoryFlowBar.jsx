export default function StoryFlowBar({
  nodes = [],
  activeNodeId,
  onSelect,
}) {
  return (
    <div className="flow-bar">
      <div className="flow-bar__track">
        {nodes.map((node, index) => (
          <div key={node.id} className="flow-node-wrap">
            <div
              className={`flow-node ${activeNodeId === node.id ? 'active' : ''}`}
              onClick={() => onSelect?.(node)}
            >
              <div className="flow-node__circle">
                {(node.iconText || node.title || '节').slice(0, 1)}
              </div>
              <div className="flow-node__label">{node.title || `节点 #${node.id}`}</div>
            </div>

            {index < nodes.length - 1 ? <div className="flow-connector" /> : null}
          </div>
        ))}
      </div>
    </div>
  )
}