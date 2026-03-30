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

export default function CharacterRelationshipModal({
  open,
  onClose,
  onConfirm,
  activeNode,
  initialData = null,
  mode = 'create',
}) {
  const [characters, setCharacters] = useState([])
  const [form, setForm] = useState({
    source_character_id: '',
    target_character_id: '',
    relation_type: '',
    relation_value: 0,
    description: '',
  })

  useEffect(() => {
    if (!open) return

    async function loadCharacters() {
      try {
        const data = await getCharacters()
        console.log('CharacterRelationshipModal getCharacters raw:', data)
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

    if (initialData) {
      setForm({
        source_character_id: String(initialData.source_character_id || ''),
        target_character_id: String(initialData.target_character_id || ''),
        relation_type: initialData.relation_type || '',
        relation_value: initialData.relation_value ?? 0,
        description: initialData.description || '',
      })
    } else {
      setForm({
        source_character_id: '',
        target_character_id: '',
        relation_type: '',
        relation_value: 0,
        description: '',
      })
    }
  }, [open, initialData])

  const handleSubmit = async () => {
    if (!activeNode?.id) {
      alert('请先选择节点')
      return
    }

    if (!form.source_character_id || !form.target_character_id) {
      alert('请选择关系双方角色')
      return
    }

    await onConfirm?.({
      story_node_id: activeNode.id,
      source_character_id: Number(form.source_character_id),
      target_character_id: Number(form.target_character_id),
      relation_type: form.relation_type.trim(),
      relation_value: Number(form.relation_value || 0),
      description: form.description.trim(),
    })
  }

  return (
    <Modal
      open={open}
      title={mode === 'edit' ? '修改角色关系' : '新建角色关系'}
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
          <label>起点角色</label>
          <select
            value={form.source_character_id}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, source_character_id: e.target.value }))
            }
          >
            <option value="">请选择角色</option>
            {characters.map((item) => (
              <option key={item.id} value={item.id}>
                {getCharacterDisplayName(item)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>终点角色</label>
          <select
            value={form.target_character_id}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, target_character_id: e.target.value }))
            }
          >
            <option value="">请选择角色</option>
            {characters.map((item) => (
              <option key={item.id} value={item.id}>
                {getCharacterDisplayName(item)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>关系类型</label>
          <input
            value={form.relation_type}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, relation_type: e.target.value }))
            }
            placeholder="例如：信任、挚友、宿敌"
          />
        </div>

        <div className="form-field">
          <label>关系数值</label>
          <input
            type="number"
            value={form.relation_value}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, relation_value: e.target.value }))
            }
          />
        </div>

        <div className="form-field">
          <label>描述</label>
          <textarea
            className="form-field__textarea form-field__textarea--lg"
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="补充关系说明、历史事件、关系变化原因等"
          />
        </div>
      </div>
    </Modal>
  )
}