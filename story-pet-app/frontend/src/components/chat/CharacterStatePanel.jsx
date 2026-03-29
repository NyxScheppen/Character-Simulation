import PanelCard from '../common/PanelCard'
import SectionTitle from '../common/SectionTitle'
import EmptyState from '../common/EmptyState'

export default function CharacterStatePanel({ states = [] }) {
  return (
    <PanelCard>
      <SectionTitle title="角色状态总览" desc="当前节点下角色状态" />
      {states.length ? (
        <div className="kv-list">
          {states.map((item) => (
            <div key={item.id} className="kv-item">
              <strong>{item.character_name || `角色 #${item.character_id}`}</strong>
              <div>心理：{item.mental_state || '暂无'}</div>
              <div>目标：{item.current_goal || '暂无'}</div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState text="还没有角色状态数据。" />
      )}
    </PanelCard>
  )
}