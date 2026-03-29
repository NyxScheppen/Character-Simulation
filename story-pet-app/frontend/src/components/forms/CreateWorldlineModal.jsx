import { useState } from 'react'
import Modal from '../common/Modal'

export default function CreateWorldlineModal({ open, onClose, onConfirm }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert('世界线名称不能为空')
      return
    }

    setSubmitting(true)
    try {
      await onConfirm?.({
        name: form.name.trim(),
        description: form.description.trim(),
      })
      setForm({
        name: '',
        description: '',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      title="新建世界线"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="mini-btn" onClick={onClose}>取消</button>
          <button type="button" className="mini-btn" onClick={handleSubmit} disabled={submitting}>创建</button>
        </>
      }
    >
      <div className="form-grid">
        <div className="form-field">
          <label>世界线名称</label>
          <input
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="例如：主世界线，女仆咖啡厅pa"
          />
        </div>

        <div className="form-field">
          <label>描述</label>
          <input
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="世界线说明"
          />
        </div>
      </div>
    </Modal>
  )
}