import PanelCard from '../common/PanelCard'
import SectionTitle from '../common/SectionTitle'
import EmptyState from '../common/EmptyState'

export default function NodeStateCard({ states = [] }) {
  return (
    <PanelCard>
      <SectionTitle title="状态" desc="节点下角色状态信息" />
      {states.length ? (
        <div className="kv-list">
          {states.map((item) => (
            <div key={item.id} className="kv-item">
              <strong>{item.character_name || `角色 #${item.character_id}`}</strong>
              <div>心理状态：{item.mental_state || '暂无'}</div>
              <div>当前目标：{item.current_goal || '暂无'}</div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState text="暂无状态数据。" />
      )}
    </PanelCard>
  )
}