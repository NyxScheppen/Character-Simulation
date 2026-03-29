import { useEffect, useState } from 'react'
import PanelCard from '../components/common/PanelCard'
import SectionTitle from '../components/common/SectionTitle'
import EmptyState from '../components/common/EmptyState'
import CreateCharacterModal from '../components/forms/CreateCharacterModal'
import EditCharacterModal from '../components/forms/EditCharacterModal'
import { getCharacters, createCharacter, updateCharacter, deleteCharacter } from '../api'

export default function CharacterPage() {
  const [characters, setCharacters] = useState([])
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingCharacter, setEditingCharacter] = useState(null)

  useEffect(() => {
    loadCharacters()
  }, [])

  async function loadCharacters() {
    try {
      const data = await getCharacters()
      setCharacters(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setCharacters([])
    }
  }

  const handleCreate = async (payload) => {
    try {
      const created = await createCharacter(payload)
      setCharacters((prev) => [created, ...prev])
      setOpen(false)
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.detail || '创建角色失败')
    }
  }

  const handleEdit = async (payload) => {
    if (!editingCharacter?.id) return

    try {
      const updated = await updateCharacter(editingCharacter.id, payload)
      setCharacters((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
      setEditOpen(false)
      setEditingCharacter(null)
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.detail || '修改角色失败')
    }
  }

  const handleDelete = async (item) => {
    const ok = window.confirm(`确定删除角色「${item.name}」吗？`)
    if (!ok) return

    try {
      await deleteCharacter(item.id)
      setCharacters((prev) => prev.filter((x) => x.id !== item.id))
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.detail || '删除角色失败')
    }
  }

  return (
    <>
      <PanelCard strong>
        <SectionTitle
          title="角色管理"
          desc="创建、查看、修改与删除角色"
          extra={
            <div className="card-inline-actions">
              <button
                type="button"
                className="circle-btn circle-btn--plusminus"
                onClick={() => setOpen(true)}
                title="新建角色"
              >
                +
              </button>
            </div>
          }
        />

        {characters.length ? (
          <div className="character-list-lg">
            {characters.map((item) => (
              <div key={item.id} className="character-card-lg">
                <div className="character-card-lg__content">
                  <div className="character-card-lg__name">{item.name}</div>
                  <div className="character-card-lg__profile">
                    {item.base_profile || '暂无基础设定'}
                  </div>
                  <div className="character-card-lg__values">
                    核心价值：{item.core_values || '暂无'}
                  </div>
                </div>

                <div className="character-card-lg__actions character-card-lg__actions--vertical">
                  <button
                    type="button"
                    className="circle-btn circle-btn--small"
                    onClick={() => {
                      setEditingCharacter(item)
                      setEditOpen(true)
                    }}
                    title="修改角色"
                  >
                    ✎
                  </button>

                  <button
                    type="button"
                    className="circle-btn circle-btn--small danger"
                    onClick={() => handleDelete(item)}
                    title="删除角色"
                  >
                    -
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="还没有角色，先新建一个吧。" />
        )}
      </PanelCard>

      <CreateCharacterModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleCreate}
      />

      <EditCharacterModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false)
          setEditingCharacter(null)
        }}
        onConfirm={handleEdit}
        character={editingCharacter}
      />
    </>
  )
}