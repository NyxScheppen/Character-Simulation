import { useEffect, useState } from 'react'
import Modal from '../common/Modal'

export default function FateChangeModal({
  open,
  onClose,
  onConfirm,
  nodes = [],
  activeNode,
}) {
  const [form, setForm] = useState({
    source_node_id: '',
    new_worldline_name: '',
    new_worldline_description: '',
    new_node_title: '',
    new_node_summary: '',
    new_node_event_description: '',
  })

  useEffect(() => {
    if (!open) return

    setForm({
      source_node_id: activeNode?.id || '',
      new_worldline_name: '',
      new_worldline_description: '',
      new_node_title: '',
      new_node_summary: '',
      new_node_event_description: '',
    })
  }, [open, activeNode])

  const handleSubmit = async () => {
    if (!form.source_node_id) {
      alert('请选择从哪个父节点继续')
      return
    }
    if (!form.new_worldline_name.trim()) {
      alert('请填写新世界线名字')
      return
    }
    if (!form.new_node_title.trim()) {
      alert('请填写新节点标题')
      return
    }

    await onConfirm?.({
      source_node_id: Number(form.source_node_id),
      payload: {
        new_worldline_name: form.new_worldline_name.trim(),
        new_worldline_description: form.new_worldline_description.trim(),
        new_node_title: form.new_node_title.trim(),
        new_node_summary: form.new_node_summary.trim(),
        new_node_event_description: form.new_node_event_description.trim(),
      },
    })
  }

  return (
    <Modal
      open={open}
      title="Fate Change"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="mini-btn" onClick={onClose}>
            取消
          </button>
          <button type="button" className="mini-btn" onClick={handleSubmit}>
            创建分叉
          </button>
        </>
      }
    >
      <div className="form-grid">
        <div className="form-field">
          <label>从哪个父节点继续</label>
          <select
            value={form.source_node_id}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, source_node_id: e.target.value }))
            }
          >
            <option value="">请选择父节点</option>
            {nodes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>新世界线名字</label>
          <input
            value={form.new_worldline_name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, new_worldline_name: e.target.value }))
            }
            placeholder="例如：Branch of Dawn"
          />
        </div>

        <div className="form-field">
          <label>新世界线描述</label>
          <input
            value={form.new_worldline_description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, new_worldline_description: e.target.value }))
            }
            placeholder="可选"
          />
        </div>

        <div className="form-field">
          <label>新节点标题</label>
          <input
            value={form.new_node_title}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, new_node_title: e.target.value }))
            }
            placeholder="例如：命运偏转"
          />
        </div>

        <div className="form-field">
          <label>新节点摘要</label>
          <input
            value={form.new_node_summary}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, new_node_summary: e.target.value }))
            }
            placeholder="可选"
          />
        </div>

        <div className="form-field">
          <label>新节点事件描述</label>
          <input
            value={form.new_node_event_description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, new_node_event_description: e.target.value }))
            }
            placeholder="可选"
          />
        </div>
      </div>
    </Modal>
  )
}