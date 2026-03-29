import PanelCard from '../common/PanelCard'
import SectionTitle from '../common/SectionTitle'
import EmptyState from '../common/EmptyState'

export default function NodeRelationshipCard({ relationships = [] }) {
  return (
    <PanelCard>
      <SectionTitle title="关系" desc="节点下角色关系信息" />
      {relationships.length ? (
        <div className="kv-list">
          {relationships.map((item) => (
            <div key={item.id} className="kv-item">
              <strong>
                {item.source_character_name || item.source_character_id}
                {' → '}
                {item.target_character_name || item.target_character_id}
              </strong>
              <div>类型：{item.relation_type || '未设定'}</div>
              <div>数值：{item.relation_value ?? '暂无'}</div>
              <div>描述：{item.description || '暂无'}</div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState text="暂无关系数据。" />
      )}
    </PanelCard>
  )
}