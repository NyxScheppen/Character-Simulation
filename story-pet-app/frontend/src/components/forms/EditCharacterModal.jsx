import { useEffect, useState } from 'react'
import Modal from '../common/Modal'

export default function EditCharacterModal({ open, onClose, onConfirm, character }) {
  const [form, setForm] = useState({
    name: '',
    base_profile: '',
    core_values: '',
  })

  useEffect(() => {
    if (open && character) {
      setForm({
        name: character.name || '',
        base_profile: character.base_profile || '',
        core_values: character.core_values || '',
      })
    }
  }, [open, character])

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert('角色名称不能为空')
      return
    }

    await onConfirm?.({
      name: form.name.trim(),
      base_profile: form.base_profile.trim(),
      core_values: form.core_values.trim(),
    })
  }

  return (
    <Modal
      open={open}
      title="修改角色"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="mini-btn" onClick={onClose}>取消</button>
          <button type="button" className="mini-btn" onClick={handleSubmit}>保存</button>
        </>
      }
    >
      <div className="form-grid">
        <div className="form-field">
          <label>角色名称</label>
          <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        </div>

        <div className="form-field">
          <label>基础设定</label>
          <input value={form.base_profile} onChange={(e) => setForm((p) => ({ ...p, base_profile: e.target.value }))} />
        </div>

        <div className="form-field">
          <label>核心价值</label>
          <input value={form.core_values} onChange={(e) => setForm((p) => ({ ...p, core_values: e.target.value }))} />
        </div>
      </div>
    </Modal>
  )
}