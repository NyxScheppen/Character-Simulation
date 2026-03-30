import { useEffect, useMemo, useState } from 'react'
import {
  getCharacters,
  createCharacter,
  updateCharacter,
  deleteCharacter,
} from '../api/modules/characters'

function normalizeListResponse(raw) {
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw?.items)) return raw.items
  if (Array.isArray(raw?.list)) return raw.list
  if (Array.isArray(raw?.results)) return raw.results
  if (Array.isArray(raw?.data)) return raw.data
  if (Array.isArray(raw?.data?.items)) return raw.data.items
  if (Array.isArray(raw?.data?.list)) return raw.data.list
  if (Array.isArray(raw?.data?.results)) return raw.data.results
  return []
}

function getCharacterDisplayName(item) {
  return item?.name || '未命名角色'
}

function getBaseProfile(item) {
  return item?.base_profile || ''
}

function getCoreValues(item) {
  return item?.core_values || ''
}

function createEmptyForm() {
  return {
    name: '',
    base_profile: '',
    core_values: '',
  }
}

function buildFormFromCharacter(item) {
  return {
    name: item?.name || '',
    base_profile: item?.base_profile || '',
    core_values: item?.core_values || '',
  }
}

function getPreviewText(item) {
  const text = getBaseProfile(item) || getCoreValues(item) || '点击查看角色详情'
  return text.length > 28 ? `${text.slice(0, 28)}...` : text
}

export default function CharacterPage() {
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [form, setForm] = useState(createEmptyForm())
  const [submitting, setSubmitting] = useState(false)

  async function loadCharacters(preferredSelectedId = null) {
    setLoading(true)
    try {
      const data = await getCharacters()
      const list = normalizeListResponse(data)

      setCharacters(list)

      if (!list.length) {
        setSelectedId(null)
        return
      }

      const targetId = preferredSelectedId ?? selectedId
      const exists = list.some((item) => String(item.id) === String(targetId))

      if (exists) {
        setSelectedId(targetId)
      } else {
        setSelectedId(list[0].id)
      }
    } catch (err) {
      console.error('CharacterPage loadCharacters error:', err)
      setCharacters([])
      setSelectedId(null)
      alert(err?.response?.data?.detail || '加载角色失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCharacters()
  }, [])

  const normalizedCharacters = useMemo(() => {
    return normalizeListResponse(characters)
  }, [characters])

  useEffect(() => {
    if (!normalizedCharacters.length) {
      setSelectedId(null)
      return
    }

    const exists = normalizedCharacters.some(
      (item) => String(item.id) === String(selectedId)
    )

    if (!exists) {
      setSelectedId(normalizedCharacters[0].id)
    }
  }, [normalizedCharacters, selectedId])

  const selectedCharacter = useMemo(() => {
    return (
      normalizedCharacters.find((item) => String(item.id) === String(selectedId)) || null
    )
  }, [normalizedCharacters, selectedId])

  function openCreateModal() {
    setModalMode('create')
    setForm(createEmptyForm())
    setModalOpen(true)
  }

  function openEditModal(character = selectedCharacter) {
    if (!character) return
    setModalMode('edit')
    setForm(buildFormFromCharacter(character))
    setModalOpen(true)
  }

  function closeModal() {
    if (submitting) return
    setModalOpen(false)
  }

  function handleFormChange(key, value) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  function buildSubmitPayload() {
    return {
      name: form.name.trim(),
      base_profile: form.base_profile.trim(),
      core_values: form.core_values.trim(),
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!form.name.trim()) {
      alert('角色名称不能为空')
      return
    }

    const payload = buildSubmitPayload()

    setSubmitting(true)
    try {
      if (modalMode === 'create') {
        const created = await createCharacter(payload)
        const newId = created?.id ?? created?.data?.id ?? null
        setModalOpen(false)
        await loadCharacters(newId)
      } else {
        if (!selectedCharacter?.id) {
          alert('未找到要编辑的角色')
          return
        }
        await updateCharacter(selectedCharacter.id, payload)
        setModalOpen(false)
        await loadCharacters(selectedCharacter.id)
      }
    } catch (err) {
      console.error('CharacterPage submit error:', err)
      alert(err?.response?.data?.detail || '保存角色失败')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(character = selectedCharacter) {
    if (!character?.id) {
      alert('没有可删除的角色')
      return
    }

    const ok = window.confirm(`确定删除角色「${getCharacterDisplayName(character)}」吗？`)
    if (!ok) return

    try {
      await deleteCharacter(character.id)
      await loadCharacters()
    } catch (err) {
      console.error('CharacterPage delete error:', err)
      alert(err?.response?.data?.detail || '删除角色失败')
    }
  }

  return (
    <div className="page-container">
      <div
        className="character-page-c"
        style={{
          display: 'grid',
          gridTemplateColumns: '430px minmax(0, 1fr)',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        <aside
          className="panel-card character-page-c__sidebar"
          style={{
            height: 'calc(100vh - 180px)',
            minHeight: '560px',
            maxHeight: 'calc(100vh - 180px)',
            overflow: 'hidden',
          }}
        >
          <div
            className="panel-card__inner character-page-c__sidebar-inner"
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div className="section-title character-page-c__title" style={{ flexShrink: 0 }}>
              <div>
                <h3>角色管理</h3>
                <div className="section-title__desc">创建、查看、修改与删除角色</div>
              </div>

              <button
                type="button"
                className="action-rail__btn"
                onClick={openCreateModal}
                title="新建角色"
              >
                +
              </button>
            </div>

            <div
              className="character-page-c__list"
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                paddingRight: '4px',
              }}
            >
              {loading ? (
                <div className="empty-state">角色加载中...</div>
              ) : normalizedCharacters.length ? (
                normalizedCharacters.map((item) => {
                  const active = String(item.id) === String(selectedId)

                  return (
                    <div
                      key={item.id}
                      className={`character-list-item ${active ? 'active' : ''}`}
                    >
                      <button
                        type="button"
                        className="character-list-item__main"
                        onClick={() => setSelectedId(item.id)}
                        title={`查看 ${getCharacterDisplayName(item)}`}
                        style={{ width: '100%' }}
                      >
                        <div className="character-list-item__text">
                          <div className="character-list-item__name">
                            {getCharacterDisplayName(item)}
                          </div>
                          <div className="character-list-item__meta">
                            {getPreviewText(item)}
                          </div>
                        </div>
                      </button>
                    </div>
                  )
                })
              ) : (
                <div className="empty-state">
                  暂无角色，点击右上角 + 创建第一个角色
                </div>
              )}
            </div>
          </div>
        </aside>

        <section className="panel-card panel-card--strong character-page-c__detail">
          <div className="panel-card__inner character-page-c__detail-inner">
            {loading ? (
              <div className="character-detail-empty">
                <div className="character-detail-empty__title">角色加载中</div>
                <div className="character-detail-empty__desc">
                  小狐狸我呀正在把角色资料端上来～
                </div>
              </div>
            ) : selectedCharacter ? (
              <>
                <div className="character-hero">
                  <div className="character-hero__main">
                    <div className="character-hero__eyebrow">CHARACTER PROFILE</div>
                    <h2 className="character-hero__name">
                      {getCharacterDisplayName(selectedCharacter)}
                    </h2>
                  </div>

                  <div
                    className="character-hero__actions"
                    style={{ display: 'flex', gap: '12px', alignItems: 'center' }}
                  >
                    <button
                      type="button"
                      className="circle-btn"
                      onClick={() => openEditModal(selectedCharacter)}
                      title="编辑角色"
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        fontSize: '20px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      🖊
                    </button>

                    <button
                      type="button"
                      className="circle-btn danger"
                      onClick={() => handleDelete(selectedCharacter)}
                      title="删除角色"
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        fontSize: '26px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1,
                      }}
                    >
                      -
                    </button>
                  </div>
                </div>

                <div className="character-detail-grid">
                  <div className="character-section-card">
                    <div className="character-section-card__title">基础设定</div>
                    <div className="character-section-card__content">
                      {getBaseProfile(selectedCharacter) || '暂无基础设定'}
                    </div>
                  </div>

                  <div className="character-section-card">
                    <div className="character-section-card__title">核心价值</div>
                    <div className="character-section-card__content">
                      {getCoreValues(selectedCharacter) || '暂无核心价值'}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="character-detail-empty">
                <div className="character-detail-empty__title">还没有可查看的角色</div>
                <div className="character-detail-empty__desc">
                  创建一个角色后，就可以在这里查看完整档案啦
                </div>
                <button type="button" className="mini-btn" onClick={openCreateModal}>
                  立即创建
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {modalOpen ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.28)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '24px',
          }}
          onClick={closeModal}
        >
          <div
            className="panel-card"
            style={{
              width: 'min(720px, 100%)',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: '28px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="panel-card__inner" style={{ padding: '28px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <h3 style={{ margin: 0 }}>
                    {modalMode === 'create' ? '新建角色' : '编辑角色'}
                  </h3>
                  <div style={{ marginTop: '6px', color: '#94a3b8', fontSize: '14px' }}>
                    填写角色名称、基础设定与核心价值
                  </div>
                </div>

                <button
                  type="button"
                  className="circle-btn"
                  onClick={closeModal}
                  title="关闭"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '16px',
                  }}
                >
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span>角色名称 *</span>
                    <input
                      value={form.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      placeholder="请输入角色名称"
                      style={inputStyle}
                    />
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span>基础设定</span>
                    <textarea
                      value={form.base_profile}
                      onChange={(e) => handleFormChange('base_profile', e.target.value)}
                      placeholder="请输入角色基础设定"
                      rows={6}
                      style={textareaStyle}
                    />
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span>核心价值</span>
                    <textarea
                      value={form.core_values}
                      onChange={(e) => handleFormChange('core_values', e.target.value)}
                      placeholder="请输入角色核心价值"
                      rows={5}
                      style={textareaStyle}
                    />
                  </label>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    marginTop: '24px',
                  }}
                >
                  <button
                    type="button"
                    className="mini-btn"
                    onClick={closeModal}
                    disabled={submitting}
                  >
                    取消
                  </button>
                  <button type="submit" className="mini-btn" disabled={submitting}>
                    {submitting ? '保存中...' : modalMode === 'create' ? '创建角色' : '保存修改'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

const inputStyle = {
  width: '100%',
  border: '1px solid rgba(148, 163, 184, 0.28)',
  borderRadius: '14px',
  padding: '12px 14px',
  outline: 'none',
  background: 'rgba(255,255,255,0.88)',
  fontSize: '14px',
  boxSizing: 'border-box',
}

const textareaStyle = {
  width: '100%',
  border: '1px solid rgba(148, 163, 184, 0.28)',
  borderRadius: '14px',
  padding: '12px 14px',
  outline: 'none',
  background: 'rgba(255,255,255,0.88)',
  fontSize: '14px',
  resize: 'vertical',
  boxSizing: 'border-box',
}