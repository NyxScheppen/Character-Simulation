import { useEffect, useState } from 'react'
import Modal from '../common/Modal'

export default function CreateNodeModal({
  open,
  onClose,
  onConfirm,
  activeWorldline,
  activeNode,   // 编辑中的节点
  currentNode,  // 当前选中的节点，用于新建时默认作为父节点
}) {
  const [form, setForm] = useState({
    worldline_id: '',
    title: '',
    summary: '',
    event_description: '',
    parent_node_id: '',
  })

  useEffect(() => {
    if (!open) return

    if (activeNode) {
      // 编辑模式：使用节点本身的数据
      setForm({
        worldline_id: activeNode.worldline_id || activeWorldline?.id || '',
        title: activeNode.title || '',
        summary: activeNode.summary || '',
        event_description: activeNode.event_description || '',
        parent_node_id: activeNode.parent_node_id || '',
      })
    } else {
      // 新建模式：默认当前世界线，默认父节点为当前选中的节点
      setForm({
        worldline_id: activeWorldline?.id || '',
        title: '',
        summary: '',
        event_description: '',
        parent_node_id: currentNode?.id || '',
      })
    }
  }, [open, activeWorldline, activeNode, currentNode])

  const handleSubmit = () => {
    if (!form.worldline_id) {
      alert('请先选择世界线')
      return
    }

    if (!form.title.trim()) {
      alert('请输入节点标题')
      return
    }

    const payload = {
      worldline_id: Number(form.worldline_id),
      title: form.title.trim(),
      summary: form.summary.trim(),
      event_description: form.event_description.trim(),
      parent_node_id: form.parent_node_id ? Number(form.parent_node_id) : null,
    }

    onConfirm?.(payload)
  }

  return (
    <Modal
      open={open}
      title={activeNode ? '编辑节点' : '新建节点'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="mini-btn" onClick={onClose}>
            取消
          </button>
          <button type="button" className="mini-btn" onClick={handleSubmit}>
            {activeNode ? '保存' : '创建'}
          </button>
        </>
      }
    >
      <div className="form-grid">
        <div className="form-field">
          <label>标题</label>
          <input
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          />
        </div>

        <div className="form-field">
          <label>摘要</label>
          <input
            value={form.summary}
            onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
          />
        </div>

        <div className="form-field">
          <label>事件描述</label>
          <input
            value={form.event_description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, event_description: e.target.value }))
            }
          />
        </div>
      </div>
    </Modal>
  )
}