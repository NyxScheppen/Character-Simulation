import { useEffect, useMemo, useState } from 'react'
import PanelCard from '../components/common/PanelCard'
import SectionTitle from '../components/common/SectionTitle'
import EmptyState from '../components/common/EmptyState'
import ActionRail from '../components/layout/ActionRail'
import CreateWorldlineModal from '../components/forms/CreateWorldlineModal'
import CreateNodeModal from '../components/forms/CreateNodeModal'
import CreateCharacterStateModal from '../components/forms/CreateCharacterStateModal'
import CharacterRelationshipModal from '../components/forms/CharacterRelationshipModal'
import FateChangeModal from '../components/forms/FateChangeModal'
import {
  getWorldlines,
  createWorldline,
  deleteWorldline,
  getStoryNodes,
  createStoryNode,
  deleteStoryNode,
  branchNode,
  getCharacterStates,
  createCharacterState,
  updateCharacterState,
  deleteCharacterState,
  getCharacterRelationships,
  createCharacterRelationship,
  updateCharacterRelationship,
  deleteCharacterRelationship,
  getCharacters,
} from '../api'
import request from '../api/request'

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
    `角色 ${item?.id ?? ''}`
  )
}

export default function WorldlinePage() {
  const [worldlines, setWorldlines] = useState([])
  const [characters, setCharacters] = useState([])

  const [activeWorldline, setActiveWorldline] = useState(null)
  const [nodes, setNodes] = useState([])
  const [activeNode, setActiveNode] = useState(null)

  const [states, setStates] = useState([])
  const [relationships, setRelationships] = useState([])

  const [worldlineOpen, setWorldlineOpen] = useState(false)
  const [nodeOpen, setNodeOpen] = useState(false)
  const [editingNode, setEditingNode] = useState(null)

  const [stateOpen, setStateOpen] = useState(false)
  const [stateEditOpen, setStateEditOpen] = useState(false)
  const [editingState, setEditingState] = useState(null)

  const [relationshipOpen, setRelationshipOpen] = useState(false)
  const [relationshipEditOpen, setRelationshipEditOpen] = useState(false)
  const [editingRelationship, setEditingRelationship] = useState(null)

  const [fateOpen, setFateOpen] = useState(false)

  const [expandedStateIds, setExpandedStateIds] = useState(new Set())
  const [expandedRelationshipIds, setExpandedRelationshipIds] = useState(new Set())

  useEffect(() => {
    loadWorldlines()
    loadCharacters()
  }, [])

  useEffect(() => {
    if (activeWorldline?.id) {
      loadNodes(activeWorldline.id)
    } else {
      setNodes([])
      setActiveNode(null)
    }
  }, [activeWorldline])

  useEffect(() => {
    if (activeNode?.id) {
      loadNodeMeta(activeNode.id)
    } else {
      setStates([])
      setRelationships([])
      setExpandedStateIds(new Set())
      setExpandedRelationshipIds(new Set())
    }
  }, [activeNode])

  async function loadCharacters() {
    try {
      const data = await getCharacters()
      console.log('WorldlinePage getCharacters raw:', data)
      setCharacters(normalizeListResponse(data))
    } catch (err) {
      console.error(err)
      setCharacters([])
    }
  }

  async function loadWorldlines() {
    try {
      const data = await getWorldlines()
      console.log('WorldlinePage getWorldlines raw:', data)
      const list = normalizeListResponse(data)
      setWorldlines(list)

      if (list.length) {
        setActiveWorldline((prev) => {
          if (prev) return list.find((item) => item.id === prev.id) || list[0]
          return list[0]
        })
      } else {
        setActiveWorldline(null)
      }
    } catch (err) {
      console.error(err)
      setWorldlines([])
      setActiveWorldline(null)
    }
  }

  async function loadNodes(worldlineId) {
    try {
      const data = await getStoryNodes({ worldline_id: worldlineId })
      console.log('WorldlinePage getStoryNodes raw:', data)
      const list = normalizeListResponse(data)
      setNodes(list)

      setActiveNode((prev) => {
        if (prev) return list.find((item) => item.id === prev.id) || null
        const rootNode = list.find((item) => item.is_root)
        return rootNode || list[0] || null
      })
    } catch (err) {
      console.error(err)
      setNodes([])
      setActiveNode(null)
    }
  }

  async function loadNodeMeta(nodeId) {
    try {
      const [stateData, relationData] = await Promise.all([
        getCharacterStates({ story_node_id: nodeId }),
        getCharacterRelationships({ story_node_id: nodeId }),
      ])

      console.log('WorldlinePage getCharacterStates raw:', stateData)
      console.log('WorldlinePage getCharacterRelationships raw:', relationData)

      setStates(normalizeListResponse(stateData))
      setRelationships(normalizeListResponse(relationData))
      setExpandedStateIds(new Set())
      setExpandedRelationshipIds(new Set())
    } catch (err) {
      console.error(err)
      setStates([])
      setRelationships([])
      setExpandedStateIds(new Set())
      setExpandedRelationshipIds(new Set())
    }
  }

  const characterNameMap = useMemo(() => {
    const map = {}
    characters.forEach((item) => {
      map[item.id] = getCharacterDisplayName(item)
    })
    return map
  }, [characters])

  const toggleExpandState = (id) => {
    setExpandedStateIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleExpandRelationship = (id) => {
    setExpandedRelationshipIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleCreateWorldline = async (payload) => {
    try {
      const created = await createWorldline(payload)
      await loadWorldlines()
      setActiveWorldline(created)
      setWorldlineOpen(false)
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.detail || '创建世界线失败')
    }
  }

  const handleDeleteWorldline = async (item) => {
    const ok = window.confirm(`确定删除世界线「${item.name}」吗？`)
    if (!ok) return

    try {
      await deleteWorldline(item.id)
      const next = worldlines.filter((x) => x.id !== item.id)
      setWorldlines(next)
      if (activeWorldline?.id === item.id) {
        setActiveWorldline(next[0] || null)
      }
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.detail || '删除世界线失败')
    }
  }

  const handleSubmitNode = async (payload) => {
    try {
      if (editingNode?.id) {
        const updated = await request
          .put(`/nodes/${editingNode.id}`, payload)
          .then((res) => res.data)

        setNodes((prev) => prev.map((item) => (item.id === editingNode.id ? updated : item)))
        setActiveNode(updated)
      } else {
        const created = await createStoryNode(payload)
        setNodes((prev) => [...prev, created])
        setActiveNode(created)
      }

      setNodeOpen(false)
      setEditingNode(null)
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.detail || (editingNode ? '编辑节点失败' : '创建节点失败'))
    }
  }

  const handleDeleteNode = async () => {
    if (!activeNode?.id) return

    const ok = window.confirm(`确定删除节点「${activeNode.title}」吗？`)
    if (!ok) return

    try {
      await deleteStoryNode(activeNode.id)
      const next = nodes.filter((item) => item.id !== activeNode.id)
      setNodes(next)
      const rootNode = next.find((item) => item.is_root)
      setActiveNode(rootNode || next[next.length - 1] || null)
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.detail || '删除节点失败')
    }
  }

  const handleCreateState = async (payload) => {
    try {
      await createCharacterState(payload)
      setStateOpen(false)
      if (activeNode?.id) loadNodeMeta(activeNode.id)
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.detail || '创建角色状态失败')
    }
  }

  const handleEditState = async (payload) => {
    if (!editingState?.id) return

    try {
      await updateCharacterState(editingState.id, payload)
      setStateEditOpen(false)
      setEditingState(null)
      if (activeNode?.id) loadNodeMeta(activeNode.id)
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.detail || '修改角色状态失败')
    }
  }

  const handleDeleteState = async (item) => {
    const roleName = characterNameMap[item.character_id] || '该角色'
    const ok = window.confirm(`确定删除 ${roleName} 的角色状态吗？`)
    if (!ok) return

    try {
      await deleteCharacterState(item.id)
      setStates((prev) => prev.filter((x) => x.id !== item.id))
      setExpandedStateIds((prev) => {
        const next = new Set(prev)
        next.delete(item.id)
        return next
      })
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.detail || '删除角色状态失败')
    }
  }

  const handleCreateRelationship = async (payload) => {
    try {
      await createCharacterRelationship(payload)
      setRelationshipOpen(false)
      if (activeNode?.id) loadNodeMeta(activeNode.id)
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.detail || '创建角色关系失败')
    }
  }

  const handleEditRelationship = async (payload) => {
    if (!editingRelationship?.id) return

    try {
      await updateCharacterRelationship(editingRelationship.id, payload)
      setRelationshipEditOpen(false)
      setEditingRelationship(null)
      if (activeNode?.id) loadNodeMeta(activeNode.id)
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.detail || '修改角色关系失败')
    }
  }

  const handleDeleteRelationship = async (item) => {
    const fromName = characterNameMap[item.source_character_id] || '未知角色'
    const toName = characterNameMap[item.target_character_id] || '未知角色'
    const ok = window.confirm(`确定删除关系「${fromName} → ${toName}」吗？`)
    if (!ok) return

    try {
      await deleteCharacterRelationship(item.id)
      setRelationships((prev) => prev.filter((x) => x.id !== item.id))
      setExpandedRelationshipIds((prev) => {
        const next = new Set(prev)
        next.delete(item.id)
        return next
      })
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.detail || '删除角色关系失败')
    }
  }

  const handleFateChange = async ({ source_node_id, payload }) => {
    try {
      await branchNode(source_node_id, payload)
      setFateOpen(false)
      await loadWorldlines()
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.detail || 'Fate Change 失败')
    }
  }

  const actions = [
    {
      key: 'create-node',
      iconText: '+',
      label: '新增节点',
      onClick: () => {
        if (!activeWorldline) return alert('请先选择世界线')
        setEditingNode(null)
        setNodeOpen(true)
      },
    },
    {
      key: 'edit-node',
      iconText: '✎',
      label: '编辑节点',
      onClick: () => {
        if (!activeNode) return alert('请先选择要编辑的节点')
        setEditingNode(activeNode)
        setNodeOpen(true)
      },
    },
    {
      key: 'delete-node',
      iconText: '-',
      label: '删除节点',
      onClick: handleDeleteNode,
    },
    {
      key: 'fate-change',
      iconText: 'F',
      label: 'Fate Change',
      onClick: () => {
        if (!activeNode) return alert('请先选择一个节点')
        setFateOpen(true)
      },
    },
  ]

  return (
    <>
      <div className="page-grid-3">
        <PanelCard>
          <SectionTitle
            title="世界线列表"
            desc="点击切换世界线"
            extra={
              <div className="card-inline-actions">
                <button
                  type="button"
                  className="circle-btn circle-btn--plusminus"
                  onClick={() => setWorldlineOpen(true)}
                  title="新增世界线"
                >
                  +
                </button>
                {activeWorldline ? (
                  <button
                    type="button"
                    className="circle-btn circle-btn--plusminus danger"
                    onClick={() => handleDeleteWorldline(activeWorldline)}
                    title="删除当前世界线"
                  >
                    -
                  </button>
                ) : null}
              </div>
            }
          />

          <div className="list-stack">
            {worldlines.length ? (
              worldlines.map((item) => (
                <div
                  key={item.id}
                  className={`list-item ${activeWorldline?.id === item.id ? 'active' : ''}`}
                >
                  <div className="list-item__main" onClick={() => setActiveWorldline(item)}>
                    <div>
                      <div className="list-item__title">{item.name}</div>
                      <div className="list-item__sub">{item.description || '暂无描述'}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState text="暂无世界线" />
            )}
          </div>
        </PanelCard>
        <div className="list-stack">
          <PanelCard>
            <SectionTitle title="节点流" desc="根节点在最左侧，点击切换节点" />
            <div className="node-line">
              {nodes.length ? (
                nodes.map((node, index) => (
                  <div key={node.id} className="node-line__item-wrap">
                    <div
                      className={`node-line__item ${activeNode?.id === node.id ? 'active' : ''}`}
                      onClick={() => setActiveNode(node)}
                    >
                      <div className={`node-line__dot ${node.is_root ? 'node-line__dot--root' : ''}`} />
                      <div className="node-line__label">
                        {node.title}
                        {node.year !== null && node.year !== undefined ? ` (${node.year})` : ''}
                      </div>
                    </div>
                    {index < nodes.length - 1 ? <div className="node-line__connector" /> : null}
                  </div>
                ))
              ) : (
                <EmptyState text="当前世界线暂无节点" />
              )}
            </div>
          </PanelCard>

          <PanelCard strong>
            <SectionTitle title="节点详情" desc="当前节点基础信息" />
            {activeNode ? (
              <div className="kv-list">
                <div className="kv-item">
                  <strong>标题</strong>
                  {activeNode.title}
                </div>
                <div className="kv-item">
                  <strong>年份</strong>
                  {activeNode.year ?? '暂无'}
                </div>
                <div className="kv-item">
                  <strong>摘要</strong>
                  {activeNode.summary || '暂无摘要'}
                </div>
                {!activeNode.is_root ? (
                  <div className="kv-item">
                    <strong>事件描述</strong>
                    {activeNode.event_description || '暂无事件描述'}
                  </div>
                ) : null}
              </div>
            ) : (
              <EmptyState text="当前世界线还没有节点。" />
            )}
          </PanelCard>

          <div className="worldline-main">
            <PanelCard className="meta-panel-fixed">
              <SectionTitle
                title="角色状态"
                desc="当前节点下每个角色的状态"
                extra={
                  <div className="card-inline-actions">
                    <button
                      type="button"
                      className="circle-btn circle-btn--plusminus"
                      onClick={() => {
                        if (!activeNode) return alert('请先选择节点')
                        setStateOpen(true)
                      }}
                      title="新增角色状态"
                    >
                      +
                    </button>
                  </div>
                }
              />

              <div className="meta-panel-fixed__body">
                {states.length ? (
                  <div className="kv-list">
                    {states.map((item) => {
                      const expanded = expandedStateIds.has(item.id)

                      return (
                        <div key={item.id} className="kv-item state-card">
                          <div className="state-card__header">
                            <strong>{characterNameMap[item.character_id] || '未知角色'}</strong>
                            <div className="state-card__meta">
                              <span className="state-card__meta-item">
                                <span className="state-meta-item__label">职业：</span>
                                <span className="state-meta-item__value">
                                  {item.profession || item.job || '暂无'}
                                </span>
                              </span>
                              <span className="state-card__meta-item">
                                <span className="state-meta-item__label">年龄：</span>
                                <span className="state-meta-item__value">
                                  {item.age ?? '暂无'}
                                </span>
                              </span>
                            </div>
                          </div>

                          <div className={`state-card__expandable ${expanded ? 'is-expanded' : ''}`}>
                            <div className="state-meta-list">
                              <div className="state-meta-item">
                                <span className="state-meta-item__label">地点：</span>
                                <span className="state-meta-item__value">{item.location || '暂无'}</span>
                              </div>
                              <div className="state-meta-item">
                                <span className="state-meta-item__label">心理：</span>
                                <span className="state-meta-item__value">{item.mental_state || '暂无'}</span>
                              </div>
                              <div className="state-meta-item">
                                <span className="state-meta-item__label">目标：</span>
                                <span className="state-meta-item__value">{item.current_goal || '暂无'}</span>
                              </div>
                              <div className="state-meta-item state-meta-item--block">
                                <span className="state-meta-item__label">补充：</span>
                                <span className="state-meta-item__value">{item.prompt_override || '暂无'}</span>
                              </div>
                              <div className="state-meta-item state-meta-item--block">
                                <span className="state-meta-item__label">关系摘要：</span>
                                <span className="state-meta-item__value">{item.relation_summary || '暂无'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="state-row-actions">
                            <button
                              type="button"
                              className={`circle-btn circle-btn--small ${expanded ? 'is-active' : ''}`}
                              onClick={() => toggleExpandState(item.id)}
                              title={expanded ? '收起' : '展开'}
                            >
                              {expanded ? '↑' : '↓'}
                            </button>
                            <button
                              type="button"
                              className="circle-btn circle-btn--small"
                              onClick={() => {
                                setEditingState(item)
                                setStateEditOpen(true)
                              }}
                              title="编辑角色状态"
                            >
                              🖊
                            </button>
                            <button
                              type="button"
                              className="circle-btn circle-btn--small danger"
                              onClick={() => handleDeleteState(item)}
                              title="删除角色状态"
                            >
                              -
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <EmptyState text="当前节点还没有角色状态。" />
                )}
              </div>
            </PanelCard>

            <PanelCard className="meta-panel-fixed">
              <SectionTitle
                title="角色关系"
                desc="当前节点下角色之间的关系"
                extra={
                  <div className="card-inline-actions">
                    <button
                      type="button"
                      className="circle-btn circle-btn--plusminus"
                      onClick={() => {
                        if (!activeNode) return alert('请先选择节点')
                        setRelationshipOpen(true)
                      }}
                      title="新增角色关系"
                    >
                      +
                    </button>
                  </div>
                }
              />

              <div className="meta-panel-fixed__body">
                {relationships.length ? (
                  <div className="kv-list">
                    {relationships.map((item) => {
                      const expanded = expandedRelationshipIds.has(item.id)
                      const fromName = characterNameMap[item.source_character_id] || '未知角色'
                      const toName = characterNameMap[item.target_character_id] || '未知角色'
                      const relationType = item.relation_type || '未设定关系'

                      return (
                        <div key={item.id} className="kv-item relation-card">
                          <div className="relation-card__header">
                            <strong>{`${fromName} → ${toName} · ${relationType}`}</strong>
                          </div>

                          <div className={`relation-card__expandable ${expanded ? 'is-expanded' : ''}`}>
                            <div className="relation-meta-list relation-meta-list--expanded">
                              <div className="relation-meta-item">
                                <span className="relation-meta-item__label">数值：</span>
                                <span className="relation-meta-item__value">
                                  {item.relation_value ?? 0}
                                </span>
                              </div>

                              <div className="relation-meta-item relation-meta-item--block">
                                <span className="relation-meta-item__label">描述：</span>
                                <span className="relation-meta-item__value">
                                  {item.description || '暂无'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="state-row-actions">
                            <button
                              type="button"
                              className={`circle-btn circle-btn--small ${expanded ? 'is-active' : ''}`}
                              onClick={() => toggleExpandRelationship(item.id)}
                              title={expanded ? '收起' : '展开'}
                            >
                              {expanded ? '↑' : '↓'}
                            </button>
                            <button
                              type="button"
                              className="circle-btn circle-btn--small"
                              onClick={() => {
                                setEditingRelationship(item)
                                setRelationshipEditOpen(true)
                              }}
                              title="修改角色关系"
                            >
                              🖊
                            </button>
                            <button
                              type="button"
                              className="circle-btn circle-btn--small danger"
                              onClick={() => handleDeleteRelationship(item)}
                              title="删除角色关系"
                            >
                              -
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <EmptyState text="暂无角色关系信息" />
                )}
              </div>
            </PanelCard>
          </div>
        </div>

        <ActionRail actions={actions} />
      </div>

      <CreateWorldlineModal
        open={worldlineOpen}
        onClose={() => setWorldlineOpen(false)}
        onConfirm={handleCreateWorldline}
      />

      <CreateNodeModal
        open={nodeOpen}
        onClose={() => {
          setNodeOpen(false)
          setEditingNode(null)
        }}
        onConfirm={handleSubmitNode}
        activeWorldline={activeWorldline}
        activeNode={editingNode}
        currentNode={activeNode}
      />

      <CreateCharacterStateModal
        open={stateOpen}
        onClose={() => setStateOpen(false)}
        onConfirm={handleCreateState}
        activeNode={activeNode}
        mode="create"
      />

      <CreateCharacterStateModal
        open={stateEditOpen}
        onClose={() => {
          setStateEditOpen(false)
          setEditingState(null)
        }}
        onConfirm={handleEditState}
        activeNode={activeNode}
        initialData={editingState}
        mode="edit"
      />

      <CharacterRelationshipModal
        open={relationshipOpen}
        onClose={() => setRelationshipOpen(false)}
        onConfirm={handleCreateRelationship}
        activeNode={activeNode}
        mode="create"
      />

      <CharacterRelationshipModal
        open={relationshipEditOpen}
        onClose={() => {
          setRelationshipEditOpen(false)
          setEditingRelationship(null)
        }}
        onConfirm={handleEditRelationship}
        activeNode={activeNode}
        initialData={editingRelationship}
        mode="edit"
      />

      <FateChangeModal
        open={fateOpen}
        onClose={() => setFateOpen(false)}
        onConfirm={handleFateChange}
        nodes={nodes}
        activeNode={activeNode}
      />
    </>
  )
}