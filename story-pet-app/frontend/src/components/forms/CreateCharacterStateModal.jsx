import { useEffect, useState } from 'react'
import Modal from '../common/Modal'
import { getCharacters } from '../../api'

export default function CreateCharacterStateModal({
  open,
  onClose,
  onConfirm,
  activeNode,
}) {
  const [characters, setCharacters] = useState([])
  const [form, setForm] = useState({
    character_id: '',
    mental_state: '',
    current_goal: '',
    prompt_override: '',
    relation_summary: '',
  })

  useEffect(() => {
    if (!open) return

    async function loadCharacters() {
      try {
        const data = await getCharacters()
        setCharacters(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
        setCharacters([])
      }
    }

    loadCharacters()
  }, [open])

  useEffect(() => {
    if (open) {
      setForm({
        character_id: '',
        mental_state: '',
        current_goal: '',
        prompt_override: '',
        relation_summary: '',
      })
    }
  }, [open])

  const handleSubmit = async () => {
    if (!activeNode?.id) {
      alert('请先选择节点')
      return
    }
    if (!form.character_id) {
      alert('请选择角色')
      return
    }

    await onConfirm?.({
      character_id: Number(form.character_id),
      story_node_id: activeNode.id,
      mental_state: form.mental_state.trim(),
      current_goal: form.current_goal.trim(),
      prompt_override: form.prompt_override.trim(),
      relation_summary: form.relation_summary.trim(),
    })
  }

  return (
    <Modal
      open={open}
      title="新建角色状态"
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
          <label>角色</label>
          <select
            value={form.character_id}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, character_id: e.target.value }))
            }
          >
            <option value="">请选择角色</option>
            {characters.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>心理状态</label>
          <input
            value={form.mental_state}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, mental_state: e.target.value }))
            }
            placeholder="例如：焦虑，游移不定，精神错乱"
          />
        </div>

        <div className="form-field">
          <label>当前目标</label>
          <input
            value={form.current_goal}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, current_goal: e.target.value }))
            }
            placeholder="例如：准备毒害罗兰"
          />
        </div>

        <div className="form-field">
          <label>额外设定</label>
          <input
            value={form.prompt_override}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, prompt_override: e.target.value }))
            }
            placeholder="可选"
          />
        </div>

        <div className="form-field">
          <label>关系摘要</label>
          <input
            value={form.relation_summary}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, relation_summary: e.target.value }))
            }
            placeholder="可选"
          />
        </div>
      </div>
    </Modal>
  )
}