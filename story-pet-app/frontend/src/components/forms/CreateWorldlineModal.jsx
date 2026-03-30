import { useEffect, useState } from 'react'
import Modal from '../common/Modal'

const initialForm = {
  name: '',
  description: '',
  root_title: '起始状态',
  root_summary: '世界线起始状态',
  root_year: '',
}

export default function CreateWorldlineModal({
  open,
  onClose,
  onConfirm,
}) {
  const [form, setForm] = useState(initialForm)

  useEffect(() => {
    if (open) {
      setForm(initialForm)
    }
  }, [open])

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert('请输入世界线名称')
      return
    }

    await onConfirm?.({
      name: form.name.trim(),
      description: form.description.trim(),
      root_title: form.root_title.trim() || '起始状态',
      root_summary: form.root_summary.trim(),
      root_event_description: '初始状态',
      root_year: form.root_year === '' ? null : Number(form.root_year),
    })
  }

  return (
    <Modal
      open={open}
      title="创建世界线"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="mini-btn" onClick={onClose}>
            取消
          </button>
          <button type="button" className="mini-btn" onClick={handleSubmit}>
            创建
          </button>
        </>
      }
    >
      <div className="form-grid">
        <div className="form-field">
          <label>世界线名称</label>
          <input
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div className="form-field">
          <label>世界线描述</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div className="form-field">
          <label>根节点标题</label>
          <input
            value={form.root_title}
            onChange={(e) => setForm((prev) => ({ ...prev, root_title: e.target.value }))}
          />
        </div>

        <div className="form-field">
          <label>根节点年份</label>
          <input
            type="number"
            value={form.root_year}
            onChange={(e) => setForm((prev) => ({ ...prev, root_year: e.target.value }))}
          />
        </div>

        <div className="form-field">
          <label>根节点摘要</label>
          <input
            value={form.root_summary}
            onChange={(e) => setForm((prev) => ({ ...prev, root_summary: e.target.value }))}
          />
        </div>
      </div>
    </Modal>
  )
}