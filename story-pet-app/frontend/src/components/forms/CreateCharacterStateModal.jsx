import { useEffect, useState } from 'react'
import Modal from '../common/Modal'
import { getCharacters } from '../../api'

function normalizeListResponse(raw) {
  if (Array.isArray(raw)) return raw
  return raw?.items || raw?.data || raw?.list || raw?.results || []
}

function getCharacterDisplayName(item) {
  return (
    item?.name ||
    item?.character_name ||
    item?.title ||
    item?.nickname ||
    '未命名角色'
  )
}

export default function CreateCharacterStateModal({
  open,
  onClose,
  onConfirm,
  activeNode,
  initialData = null,
  mode = 'create',
}) {
  const [characters, setCharacters] = useState([])
  const [form, setForm] = useState({
    character_id: '',
    mental_state: '',
    current_goal: '',
    prompt_override: '',
    relation_summary: '',
    profession: '',
    age: '',
    location: '',
  })

  useEffect(() => {
    if (!open) return

    async function loadCharacters() {
      try {
        const data = await getCharacters()
        console.log('CreateCharacterStateModal getCharacters raw:', data)
        setCharacters(normalizeListResponse(data))
      } catch (err) {
        console.error(err)
        setCharacters([])
      }
    }

    loadCharacters()
  }, [open])

  useEffect(() => {
    if (!open) return

    if (mode === 'edit' && initialData) {
      setForm({
        character_id: String(initialData.character_id || ''),
        mental_state: initialData.mental_state || '',
        current_goal: initialData.current_goal || '',
        prompt_override: initialData.prompt_override || '',
        relation_summary: initialData.relation_summary || '',
        profession: initialData.profession || '',
        age:
          initialData.age !== null && initialData.age !== undefined
            ? String(initialData.age)
            : '',
        location: initialData.location || '',
      })
    } else {
      setForm({
        character_id: '',
        mental_state: '',
        current_goal: '',
        prompt_override: '',
        relation_summary: '',
        profession: '',
        age: '',
        location: '',
      })
    }
  }, [open, mode, initialData])

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
      profession: form.profession.trim(),
      age: form.age === '' ? null : Number(form.age),
      location: form.location.trim(),
    })
  }

  return (
    <Modal
      open={open}
      title={mode === 'edit' ? '编辑角色状态' : '新建角色状态'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="mini-btn" onClick={onClose}>
            取消
          </button>
          <button type="button" className="mini-btn" onClick={handleSubmit}>
            {mode === 'edit' ? '保存' : '创建'}
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
            disabled={mode === 'edit'}
          >
            <option value="">请选择角色</option>
            {characters.map((item) => (
              <option key={item.id} value={item.id}>
                {getCharacterDisplayName(item)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-grid form-grid--two">
          <div className="form-field">
            <label>职业</label>
            <input
              value={form.profession}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, profession: e.target.value }))
              }
            />
          </div>

          <div className="form-field">
            <label>年龄</label>
            <input
              type="number"
              value={form.age}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, age: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="form-field">
          <label>地点</label>
          <input
            value={form.location}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, location: e.target.value }))
            }
          />
        </div>

        <div className="form-field">
          <label>心理状态</label>
          <input
            value={form.mental_state}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, mental_state: e.target.value }))
            }
          />
        </div>

        <div className="form-field">
          <label>当前目标</label>
          <input
            value={form.current_goal}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, current_goal: e.target.value }))
            }
          />
        </div>

        <div className="form-field">
          <label>额外设定</label>
          <textarea
            className="form-field__textarea form-field__textarea--lg"
            value={form.prompt_override}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, prompt_override: e.target.value }))
            }
            placeholder="人物隐藏背景、语言风格、禁忌、细节习惯、成长弧光等"
          />
        </div>

        <div className="form-field">
          <label>关系摘要</label>
          <textarea
            className="form-field__textarea"
            value={form.relation_summary}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, relation_summary: e.target.value }))
            }
            placeholder="当前节点下该角色与其他角色的重要关系脉络"
          />
        </div>
      </div>
    </Modal>
  )
}