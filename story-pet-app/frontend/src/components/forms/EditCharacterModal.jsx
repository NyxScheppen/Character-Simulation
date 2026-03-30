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
          <button type="button" className="mini-btn" onClick={onClose}>
            取消
          </button>
          <button type="button" className="mini-btn" onClick={handleSubmit}>
            保存
          </button>
        </>
      }
    >
      <div className="form-grid">
        <div className="form-field">
          <label>角色名称</label>
          <input
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="请输入角色名称"
          />
        </div>

        <div className="form-field">
          <label>基础设定</label>
          <textarea
            className="form-field__textarea form-field__textarea--lg"
            value={form.base_profile}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, base_profile: e.target.value }))
            }
            placeholder="角色背景、经历、外貌、身份等（可写长）"
          />
        </div>

        <div className="form-field">
          <label>核心价值</label>
          <textarea
            className="form-field__textarea form-field__textarea--lg"
            value={form.core_values}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, core_values: e.target.value }))
            }
            placeholder="角色的信念、原则、底线、价值观等（可写长）"
          />
        </div>
      </div>
    </Modal>
  )
}