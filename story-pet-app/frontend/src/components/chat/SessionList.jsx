import PanelCard from '../common/PanelCard'
import SectionTitle from '../common/SectionTitle'

export default function SessionList({
  sessions = [],
  activeSessionId,
  onSelect,
  onCreate,
  onDelete,
}) {
  return (
    <PanelCard>
      <SectionTitle
        title="会话列表"
        desc="当前项目内的对话记录"
        extra={
          <button type="button" className="mini-btn" onClick={onCreate}>
            ＋ 新建会话
          </button>
        }
      />

      <div className="list-stack">
        {sessions.map((item) => (
          <div
            key={item.id}
            className={`list-item ${activeSessionId === item.id ? 'active' : ''}`}
          >
            <div className="list-item__main" onClick={() => onSelect?.(item)}>
              <div>
                <div className="list-item__title">{item.title || '未命名会话'}</div>
                <div className="list-item__sub">
                  你扮演：{item.user_role || '未填写'}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="circle-btn circle-btn--small danger"
              onClick={() => onDelete?.(item)}
              title="删除会话"
            >
              -
            </button>
          </div>
        ))}
      </div>
    </PanelCard>
  )
}