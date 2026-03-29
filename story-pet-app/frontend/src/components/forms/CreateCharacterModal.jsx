import { useState } from 'react'
import Modal from '../common/Modal'

export default function CreateCharacterModal({ open, onClose, onConfirm }) {
  const [form, setForm] = useState({
    name: '',
    base_profile: '',
    core_values: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert('角色名称不能为空')
      return
    }

    setSubmitting(true)
    try {
      await onConfirm?.({
        name: form.name.trim(),
        base_profile: form.base_profile.trim(),
        core_values: form.core_values.trim(),
      })
      setForm({
        name: '',
        base_profile: '',
        core_values: '',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      title="新建角色"
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
          <label>角色名称</label>
          <input
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="例如：尼克斯"
          />
        </div>

        <div className="form-field">
          <label>基础设定</label>
          <input
            value={form.base_profile}
            onChange={(e) => handleChange('base_profile', e.target.value)}
            placeholder="角色基础介绍"
          />
        </div>

        <div className="form-field">
          <label>核心价值</label>
          <input
            value={form.core_values}
            onChange={(e) => handleChange('core_values', e.target.value)}
            placeholder="角色的核心价值观"
          />
        </div>
      </div>
    </Modal>
  )
}