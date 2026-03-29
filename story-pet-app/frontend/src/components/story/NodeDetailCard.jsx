import PanelCard from '../common/PanelCard'
import SectionTitle from '../common/SectionTitle'

export default function NodeDetailCard({ node }) {
  return (
    <PanelCard strong>
      <SectionTitle title="详情" desc="当前节点基础信息" />
      <div className="kv-list">
        <div className="kv-item">
          <strong>标题</strong>
          {node?.title || '未选择节点'}
        </div>
        <div className="kv-item">
          <strong>摘要</strong>
          {node?.summary || '暂无摘要'}
        </div>
        <div className="kv-item">
          <strong>说明</strong>
          {node?.description || '暂无说明'}
        </div>
      </div>
    </PanelCard>
  )
}