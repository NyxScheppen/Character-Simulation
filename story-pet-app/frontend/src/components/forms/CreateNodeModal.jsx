import { useEffect, useState } from 'react'
import Modal from '../common/Modal'

export default function CreateNodeModal({
  open,
  onClose,
  onConfirm,
  activeWorldline,
  activeNode,
  currentNode,
}) {
  const [form, setForm] = useState({
    worldline_id: '',
    title: '',
    summary: '',
    event_description: '',
    year: '',
    parent_node_id: '',
  })

  useEffect(() => {
    if (!open) return

    if (activeNode) {
      setForm({
        worldline_id: activeNode.worldline_id || activeWorldline?.id || '',
        title: activeNode.title || '',
        summary: activeNode.summary || '',
        event_description: activeNode.is_root ? '初始状态' : (activeNode.event_description || ''),
        year:
          activeNode.year !== null && activeNode.year !== undefined
            ? String(activeNode.year)
            : '',
        parent_node_id:
          activeNode.parent_node_id !== null && activeNode.parent_node_id !== undefined
            ? activeNode.parent_node_id
            : '',
      })
    } else {
      setForm({
        worldline_id: activeWorldline?.id || '',
        title: '',
        summary: '',
        event_description: '',
        year: '',
        parent_node_id: currentNode?.id || '',
      })
    }
  }, [open, activeWorldline, activeNode, currentNode])

  const isEditingRootNode = Boolean(activeNode?.is_root)
  const parentYear =
    !isEditingRootNode && currentNode?.year !== null && currentNode?.year !== undefined
      ? Number(currentNode.year)
      : null

  const handleSubmit = () => {
    if (!form.worldline_id) {
      alert('请先选择世界线')
      return
    }

    if (!form.title.trim()) {
      alert('请输入节点标题')
      return
    }

    const year = form.year === '' ? null : Number(form.year)

    if (
      !isEditingRootNode &&
      parentYear !== null &&
      year !== null &&
      year < parentYear
    ) {
      alert(`节点年份不能小于父节点年份（父节点年份：${parentYear}）`)
      return
    }

    const payload = {
      worldline_id: Number(form.worldline_id),
      title: form.title.trim(),
      summary: form.summary.trim(),
      event_description: isEditingRootNode
        ? '初始状态'
        : (form.event_description.trim() || '初始状态'),
      year,
      parent_node_id: isEditingRootNode
        ? null
        : form.parent_node_id
          ? Number(form.parent_node_id)
          : null,
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
            placeholder="请输入节点标题"
          />
        </div>

        <div className="form-field">
          <label>年份</label>
          <input
            type="number"
            value={form.year}
            onChange={(e) => setForm((prev) => ({ ...prev, year: e.target.value }))}
            placeholder="例如：1998"
          />
        </div>

        <div className="form-field">
          <label>摘要</label>
          <input
            value={form.summary}
            onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
            placeholder="请输入节点摘要"
          />
        </div>

        {!isEditingRootNode ? (
          <div className="form-field">
            <label>事件描述</label>
            <textarea
              value={form.event_description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, event_description: e.target.value }))
              }
              placeholder="请输入事件描述"
            />
          </div>
        ) : (
          <div className="form-field">
            <label>事件描述</label>
            <input value="初始状态" disabled />
          </div>
        )}
      </div>
    </Modal>
  )
}