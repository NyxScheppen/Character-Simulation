export default function EmptyState({ text = '这里还没有内容。' }) {
  return <div className="empty-state">{text}</div>
}