import { useEffect, useMemo, useRef, useState } from 'react'
import PanelCard from '../components/common/PanelCard'
import SectionTitle from '../components/common/SectionTitle'
import EmptyState from '../components/common/EmptyState'
import { getWorldlines, getStoryNodes, getNodeRelationshipGraph } from '../api'
import { storageGet, storageSet } from '../utils/storage'

function normalizeListResponse(raw) {
  if (Array.isArray(raw)) return raw
  return raw?.items || raw?.data || raw?.list || raw?.results || []
}

function getCharacterName(item) {
  return (
    item?.name ||
    item?.character_name ||
    item?.title ||
    item?.nickname ||
    `角色 ${item?.id ?? ''}`
  )
}

function normalizeGraphResponse(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      story_node: null,
      characters: [],
      relationships: [],
    }
  }

  return {
    story_node: raw.story_node || raw.node || raw.current_node || null,
    characters: normalizeListResponse(
      raw.characters || raw.nodes || raw.character_list || raw.node_list || []
    ),
    relationships: normalizeListResponse(
      raw.relationships || raw.edges || raw.links || raw.relation_list || []
    ),
  }
}

function normalizeCharacters(chars) {
  return normalizeListResponse(chars)
    .map((item) => ({
      ...item,
      id: item.id ?? item.character_id,
      name: getCharacterName(item),
    }))
    .filter((item) => item.id !== undefined && item.id !== null)
}

function normalizeRelationships(rels) {
  return normalizeListResponse(rels)
    .map((item, index) => ({
      ...item,
      id: item.id ?? `rel-${index}-${item.source_character_id}-${item.target_character_id}`,
      source_character_id:
        item.source_character_id ?? item.source_id ?? item.from_character_id ?? item.from_id,
      target_character_id:
        item.target_character_id ?? item.target_id ?? item.to_character_id ?? item.to_id,
      relation_type: item.relation_type ?? item.type ?? item.label ?? '',
      relation_value:
        Number(item.relation_value ?? item.value ?? item.score ?? item.weight ?? 0) || 0,
      description: item.description ?? item.desc ?? item.remark ?? '',
    }))
    .filter(
      (item) =>
        item.source_character_id !== undefined &&
        item.source_character_id !== null &&
        item.target_character_id !== undefined &&
        item.target_character_id !== null
    )
}

function buildInitialPositions(characters, width, height) {
  const count = characters.length
  if (!count) return []

  const cx = width / 2
  const cy = height / 2
  const radius = Math.min(width, height) * 0.31

  return characters.map((item, index) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2
    return {
      ...item,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    }
  })
}

function getCircleRadius(name) {
  return Math.max(34, Math.min(56, 24 + (name?.length || 0) * 3))
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function estimateLabelWidth(text = '') {
  return Math.max(40, text.length * 13)
}

function relaxNodePositions(inputNodes, width, height, iterations = 72) {
  const nodes = inputNodes.map((node) => ({ ...node }))
  if (nodes.length <= 1) return nodes

  const centerX = width / 2
  const centerY = height / 2

  for (let step = 0; step < iterations; step += 1) {
    const forces = nodes.map(() => ({ x: 0, y: 0 }))

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i]
        const b = nodes[j]

        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001

        const minDist = getCircleRadius(a.name) + getCircleRadius(b.name) + 36

        if (dist < minDist) {
          const overlap = minDist - dist
          const nx = dx / dist
          const ny = dy / dist
          const push = overlap * 0.16

          forces[i].x -= nx * push
          forces[i].y -= ny * push
          forces[j].x += nx * push
          forces[j].y += ny * push
        }
      }
    }

    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i]
      const r = getCircleRadius(node.name)

      forces[i].x += (centerX - node.x) * 0.0025
      forces[i].y += (centerY - node.y) * 0.0025

      node.x = clamp(node.x + forces[i].x, r + 12, width - r - 12)
      node.y = clamp(node.y + forces[i].y, r + 12, height - r - 12)
    }
  }

  return nodes
}

function getSafeLineStyle(value, isSelected, isRelatedToSelectedNode, selectedEdge, selectedCharacter) {
  const absValue = Math.min(100, Math.abs(Number(value || 0)))

  if (isSelected) {
    return {
      opacity: 0.96,
      strokeWidth: 3,
    }
  }

  if (selectedEdge) {
    return {
      opacity: isRelatedToSelectedNode ? 0.6 : 0.12,
      strokeWidth: Math.max(1.4, Math.min(4.4, 1.2 + absValue / 35)),
    }
  }

  if (selectedCharacter) {
    return {
      opacity: isRelatedToSelectedNode ? 0.78 : 0.12,
      strokeWidth: isRelatedToSelectedNode
        ? Math.max(1.6, Math.min(4.6, 1.4 + absValue / 34))
        : 1.1,
    }
  }

  return {
    opacity: 0.3 + absValue / 230,
    strokeWidth: Math.max(1.1, Math.min(4, 1.1 + absValue / 40)),
  }
}

function getGraphLayoutStorageKey(nodeId) {
  return `relationship-graph-layout:${nodeId}`
}

function saveGraphLayout(nodeId, positions) {
  if (!nodeId) return
  try {
    const payload = positions.map((item) => ({
      id: item.id,
      x: item.x,
      y: item.y,
    }))
    storageSet(getGraphLayoutStorageKey(nodeId), JSON.stringify(payload))
  } catch (err) {
    console.error('saveGraphLayout failed:', err)
  }
}

function safeGetLocalStorage(key) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.storageGet(key)
    }
  } catch (err) {
    console.warn('storageGet failed:', err)
  }
  return null
}

function loadGraphLayout(nodeId, characters, width, height) {
  if (!nodeId) return null

  try {
    const raw = safeGetLocalStorage(getGraphLayoutStorageKey(nodeId))
    if (!raw) return null

    const saved = JSON.parse(raw)
    if (!Array.isArray(saved)) return null

    const savedMap = {}
    saved.forEach((item) => {
      if (item?.id !== undefined && item?.id !== null) {
        savedMap[item.id] = item
      }
    })

    const restored = []
    const missing = []

    characters.forEach((char) => {
      const hit = savedMap[char.id]
      if (hit) {
        const r = getCircleRadius(char.name)
        restored.push({
          ...char,
          x: clamp(Number(hit.x ?? width / 2), r + 12, width - r - 12),
          y: clamp(Number(hit.y ?? height / 2), r + 12, height - r - 12),
        })
      } else {
        missing.push(char)
      }
    })

    if (!restored.length && !missing.length) return null
    if (!restored.length && missing.length === characters.length) return null

    if (missing.length) {
      const initialMissing = buildInitialPositions(missing, width, height)
      const relaxedMissing = relaxNodePositions(initialMissing, width, height, 36)
      return [...restored, ...relaxedMissing]
    }

    return restored
  } catch (err) {
    console.error('loadGraphLayout failed:', err)
    return null
  }
}

export default function RelationshipGraphPage() {
  const [worldlines, setWorldlines] = useState([])
  const [nodes, setNodes] = useState([])
  const [activeWorldlineId, setActiveWorldlineId] = useState('')
  const [activeNodeId, setActiveNodeId] = useState('')
  const [graphData, setGraphData] = useState(null)
  const [loading, setLoading] = useState(false)

  const [positions, setPositions] = useState([])
  const [selectedEdge, setSelectedEdge] = useState(null)
  const [selectedCharacter, setSelectedCharacter] = useState(null)

  const svgRef = useRef(null)
  const positionsRef = useRef([])
  const dragStateRef = useRef({
    nodeId: null,
    startMouseX: 0,
    startMouseY: 0,
    offsetX: 0,
    offsetY: 0,
    moved: false,
  })

  const width = 980
  const height = 760

  useEffect(() => {
    loadWorldlines()
  }, [])

  useEffect(() => {
    positionsRef.current = positions
  }, [positions])

  useEffect(() => {
    if (!activeWorldlineId) {
      setNodes([])
      setActiveNodeId('')
      setGraphData(null)
      setPositions([])
      setSelectedEdge(null)
      setSelectedCharacter(null)
      return
    }
    loadNodes(activeWorldlineId)
  }, [activeWorldlineId])

  useEffect(() => {
    if (!activeNodeId) {
      setGraphData(null)
      setPositions([])
      setSelectedEdge(null)
      setSelectedCharacter(null)
      return
    }
    loadGraph(activeNodeId)
  }, [activeNodeId])

  useEffect(() => {
    const chars = normalizeCharacters(graphData?.characters || [])

    if (!chars.length) {
      setPositions([])
      setSelectedEdge(null)
      setSelectedCharacter(null)
      return
    }

    const restored = loadGraphLayout(activeNodeId, chars, width, height)

    if (restored?.length) {
      setPositions(restored)
    } else {
      const initial = buildInitialPositions(chars, width, height)
      const nextPositions = relaxNodePositions(initial, width, height, 88)
      setPositions(nextPositions)
      saveGraphLayout(activeNodeId, nextPositions)
    }

    setSelectedEdge(null)
    setSelectedCharacter(null)
    dragStateRef.current = {
      nodeId: null,
      startMouseX: 0,
      startMouseY: 0,
      offsetX: 0,
      offsetY: 0,
      moved: false,
    }
  }, [graphData, activeNodeId])

  useEffect(() => {
    function getSvgPoint(clientX, clientY) {
      const svg = svgRef.current
      if (!svg) return null

      const rect = svg.getBoundingClientRect()
      const scaleX = width / rect.width
      const scaleY = height / rect.height

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      }
    }

    function handlePointerMove(event) {
      const drag = dragStateRef.current
      if (!drag.nodeId) return

      const point = getSvgPoint(event.clientX, event.clientY)
      if (!point) return

      const movedDistance = Math.sqrt(
        Math.pow(event.clientX - drag.startMouseX, 2) +
          Math.pow(event.clientY - drag.startMouseY, 2)
      )

      if (movedDistance > 4) drag.moved = true
      if (!drag.moved) return

      setPositions((prev) =>
        prev.map((node) => {
          if (node.id !== drag.nodeId) return node
          const r = getCircleRadius(node.name)
          return {
            ...node,
            x: clamp(point.x - drag.offsetX, r + 12, width - r - 12),
            y: clamp(point.y - drag.offsetY, r + 12, height - r - 12),
          }
        })
      )
    }

    function handlePointerUp() {
      const drag = dragStateRef.current

      if (drag.nodeId && drag.moved) {
        saveGraphLayout(activeNodeId, positionsRef.current)
      }

      dragStateRef.current = {
        nodeId: null,
        startMouseX: 0,
        startMouseY: 0,
        offsetX: 0,
        offsetY: 0,
        moved: false,
      }
    }

    window.addEventListener('mousemove', handlePointerMove)
    window.addEventListener('mouseup', handlePointerUp)

    return () => {
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('mouseup', handlePointerUp)
    }
  }, [activeNodeId])

  async function loadWorldlines() {
    try {
      const data = await getWorldlines()
      console.log('RelationshipGraphPage getWorldlines raw:', data)
      const list = normalizeListResponse(data)
      setWorldlines(list)
      if (list.length) setActiveWorldlineId(String(list[0].id))
    } catch (err) {
      console.error(err)
      setWorldlines([])
    }
  }

  async function loadNodes(worldlineId) {
    try {
      const data = await getStoryNodes({ worldline_id: worldlineId })
      console.log('RelationshipGraphPage getStoryNodes raw:', data)
      const list = normalizeListResponse(data)
      setNodes(list)
      if (list.length) {
        const rootNode = list.find((item) => item.is_root)
        setActiveNodeId(String((rootNode || list[0]).id))
      } else {
        setActiveNodeId('')
      }
    } catch (err) {
      console.error(err)
      setNodes([])
      setActiveNodeId('')
    }
  }

  async function loadGraph(nodeId) {
    setLoading(true)
    try {
      const raw = await getNodeRelationshipGraph(nodeId)
      console.log('RelationshipGraphPage getNodeRelationshipGraph raw:', raw)

      const normalized = normalizeGraphResponse(raw)
      normalized.characters = normalizeCharacters(normalized.characters)
      normalized.relationships = normalizeRelationships(normalized.relationships)

      setGraphData(normalized)
    } catch (err) {
      console.error(err)
      setGraphData(null)
      alert(err?.response?.data?.detail || '加载关系图失败')
    } finally {
      setLoading(false)
    }
  }

  function resetLayout() {
    const chars = normalizeCharacters(graphData?.characters || [])
    const initial = buildInitialPositions(chars, width, height)
    const nextPositions = relaxNodePositions(initial, width, height, 88)

    setPositions(nextPositions)
    saveGraphLayout(activeNodeId, nextPositions)

    setSelectedEdge(null)
    setSelectedCharacter(null)
    dragStateRef.current = {
      nodeId: null,
      startMouseX: 0,
      startMouseY: 0,
      offsetX: 0,
      offsetY: 0,
      moved: false,
    }
  }

  const nodeMap = useMemo(() => {
    const map = {}
    positions.forEach((item) => {
      map[item.id] = item
    })
    return map
  }, [positions])

  const characterMap = useMemo(() => {
    const map = {}
    normalizeCharacters(graphData?.characters || []).forEach((item) => {
      map[item.id] = item
    })
    return map
  }, [graphData])

  const edges = useMemo(
    () => normalizeRelationships(graphData?.relationships || []),
    [graphData]
  )

  const selectedNodeIds = useMemo(() => {
    if (selectedEdge) {
      return new Set([selectedEdge.source_character_id, selectedEdge.target_character_id])
    }
    if (selectedCharacter) {
      const relatedIds = new Set([selectedCharacter.id])
      edges.forEach((edge) => {
        if (edge.source_character_id === selectedCharacter.id) {
          relatedIds.add(edge.target_character_id)
        }
        if (edge.target_character_id === selectedCharacter.id) {
          relatedIds.add(edge.source_character_id)
        }
      })
      return relatedIds
    }
    return new Set()
  }, [selectedEdge, selectedCharacter, edges])

  const sortedPositions = useMemo(() => {
    const activeDragId = dragStateRef.current.nodeId
    const list = [...positions]
    list.sort((a, b) => {
      if (a.id === activeDragId) return 1
      if (b.id === activeDragId) return -1
      if (selectedNodeIds.has(a.id) && !selectedNodeIds.has(b.id)) return 1
      if (!selectedNodeIds.has(a.id) && selectedNodeIds.has(b.id)) return -1
      return 0
    })
    return list
  }, [positions, selectedNodeIds])

  const selectedCharacterRelations = useMemo(() => {
    if (!selectedCharacter) return []

    return edges
      .filter(
        (edge) =>
          edge.source_character_id === selectedCharacter.id ||
          edge.target_character_id === selectedCharacter.id
      )
      .map((edge) => {
        const source = characterMap[edge.source_character_id]
        const target = characterMap[edge.target_character_id]

        return {
          ...edge,
          source_name: getCharacterName(source),
          target_name: getCharacterName(target),
        }
      })
      .sort((a, b) => Math.abs(b.relation_value || 0) - Math.abs(a.relation_value || 0))
  }, [selectedCharacter, edges, characterMap])

  const beginNodeDrag = (event, node) => {
    event.stopPropagation()

    const svg = svgRef.current
    if (!svg) return

    const rect = svg.getBoundingClientRect()
    const scaleX = width / rect.width
    const scaleY = height / rect.height
    const mouseX = (event.clientX - rect.left) * scaleX
    const mouseY = (event.clientY - rect.top) * scaleY

    dragStateRef.current = {
      nodeId: node.id,
      startMouseX: event.clientX,
      startMouseY: event.clientY,
      offsetX: mouseX - node.x,
      offsetY: mouseY - node.y,
      moved: false,
    }

    setPositions((prev) => {
      const target = prev.find((item) => item.id === node.id)
      const others = prev.filter((item) => item.id !== node.id)
      return target ? [...others, target] : prev
    })
  }

  const handleNodeClick = (event, node) => {
    event.stopPropagation()
    if (dragStateRef.current.moved) return
    setSelectedEdge(null)
    setSelectedCharacter(characterMap[node.id] || node)
  }

  const handleEdgeSelect = (edge, source, target) => {
    setSelectedCharacter(null)
    setSelectedEdge({
      ...edge,
      source_name: getCharacterName(source),
      target_name: getCharacterName(target),
    })
  }

  const clearSelections = () => {
    setSelectedEdge(null)
    setSelectedCharacter(null)
  }

  return (
    <div className="relationship-graph-page relationship-graph-page--three-col-fixed">
      <aside className="relationship-graph-left-col">
        <PanelCard className="mini-panel mini-panel--selector">
          <SectionTitle title="世界线" desc="选择当前世界线" />
          <div className="mini-panel__body">
            {worldlines.length ? (
              <div className="list-stack">
                {worldlines.map((item) => (
                  <div
                    key={item.id}
                    className={`list-item ${String(item.id) === String(activeWorldlineId) ? 'active' : ''}`}
                  >
                    <div
                      className="list-item__main"
                      onClick={() => setActiveWorldlineId(String(item.id))}
                    >
                      <div>
                        <div className="list-item__title">{item.name}</div>
                        <div className="list-item__sub">
                          {item.description || '暂无描述'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState text="暂无世界线" />
            )}
          </div>
        </PanelCard>

        <PanelCard className="mini-panel mini-panel--selector">
          <SectionTitle title="剧情节点" desc="选择剧情节点" />
          <div className="mini-panel__body">
            {nodes.length ? (
              <div className="list-stack">
                {nodes.map((item) => (
                  <div
                    key={item.id}
                    className={`list-item ${String(item.id) === String(activeNodeId) ? 'active' : ''}`}
                  >
                    <div
                      className="list-item__main"
                      onClick={() => setActiveNodeId(String(item.id))}
                    >
                      <div>
                        <div className="list-item__title">
                          {item.title}
                          {item.year !== null && item.year !== undefined ? ` · ${item.year}` : ''}
                        </div>
                        <div className="list-item__sub">
                          {item.summary || '暂无摘要'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState text="当前世界线暂无节点" />
            )}
          </div>
        </PanelCard>
      </aside>

      <main className="relationship-graph-center-col">
        <PanelCard strong className="graph-stage-card">
          <div className="panel-head-row">
            <SectionTitle
              title={graphData?.story_node?.title || '人物关系图'}
              desc="点击人物查看关系文字，点击关系线查看右下详情"
            />
            <div className="panel-head-actions">
              <button
                type="button"
                className="mini-btn"
                onClick={resetLayout}
                disabled={!graphData || !positions.length}
              >
                重置布局
              </button>
            </div>
          </div>

          {loading ? (
            <EmptyState text="关系图加载中..." />
          ) : !graphData || !positions.length ? (
            <EmptyState text="当前剧情节点暂无可展示的人物关系" />
          ) : (
            <div className="relation-graph-wrap relation-graph-wrap--stage">
              <svg
                ref={svgRef}
                className="relation-graph"
                viewBox={`0 0 ${width} ${height}`}
                role="img"
              >
                <rect
                  x="0"
                  y="0"
                  width={width}
                  height={height}
                  fill="transparent"
                  onMouseDown={clearSelections}
                />

                <defs>
                  <marker
                    id="relation-arrow-small"
                    viewBox="0 0 10 10"
                    refX="8.4"
                    refY="5"
                    markerWidth="4"
                    markerHeight="4"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" className="relation-arrow-head" />
                  </marker>
                </defs>

                {edges.map((edge) => {
                  const source = nodeMap[edge.source_character_id]
                  const target = nodeMap[edge.target_character_id]
                  if (!source || !target) return null

                  const shouldHideEdge =
                    !!selectedCharacter &&
                    edge.source_character_id !== selectedCharacter.id &&
                    edge.target_character_id !== selectedCharacter.id

                  if (shouldHideEdge) return null

                  const sourceR = getCircleRadius(source.name)
                  const targetR = getCircleRadius(target.name)

                  const dx = target.x - source.x
                  const dy = target.y - source.y
                  const dist = Math.sqrt(dx * dx + dy * dy) || 1
                  const nx = dx / dist
                  const ny = dy / dist

                  const startX = source.x + nx * sourceR
                  const startY = source.y + ny * sourceR
                  const endX = target.x - nx * targetR
                  const endY = target.y - ny * targetR

                  const reverseExists = edges.some(
                    (rel) =>
                      rel.id !== edge.id &&
                      rel.source_character_id === edge.target_character_id &&
                      rel.target_character_id === edge.source_character_id
                  )

                  const curveOffset = reverseExists ? 20 : 0
                  const midX = (startX + endX) / 2 - ny * curveOffset
                  const midY = (startY + endY) / 2 + nx * curveOffset

                  const path = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`

                  const isSelected = selectedEdge?.id === edge.id
                  const isRelatedToSelectedNode =
                    selectedNodeIds.has(edge.source_character_id) ||
                    selectedNodeIds.has(edge.target_character_id)

                  const lineStyle = getSafeLineStyle(
                    edge.relation_value,
                    isSelected,
                    isRelatedToSelectedNode,
                    selectedEdge,
                    selectedCharacter
                  )

                  const showLabel =
                    !!selectedCharacter &&
                    (edge.relation_type || '').trim() &&
                    (
                      edge.source_character_id === selectedCharacter.id ||
                      edge.target_character_id === selectedCharacter.id
                    )

                  const labelX = midX
                  const labelY = midY - 16
                  const labelWidth = estimateLabelWidth(edge.relation_type)

                  return (
                    <g key={edge.id}>
                      <path
                        d={path}
                        className="relation-edge-hitbox"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdgeSelect(edge, source, target)
                        }}
                      />

                      <path
                        d={path}
                        className={`relation-edge ${edge.relation_value >= 0 ? 'relation-edge--positive' : 'relation-edge--negative'} ${isSelected ? 'is-selected' : ''}`}
                        style={lineStyle}
                        markerEnd="url(#relation-arrow-small)"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdgeSelect(edge, source, target)
                        }}
                      />

                      {showLabel ? (
                        <g className="relation-edge-label-group" pointerEvents="none">
                          <rect
                            x={labelX - labelWidth / 2 - 6}
                            y={labelY - 13}
                            width={labelWidth + 12}
                            height={22}
                            rx={11}
                            className="relation-edge-label-bg"
                          />
                          <text
                            x={labelX}
                            y={labelY + 2}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="relation-edge__text relation-edge__text--upright"
                          >
                            {edge.relation_type}
                          </text>
                        </g>
                      ) : null}
                    </g>
                  )
                })}
                {sortedPositions.map((node) => {
                  const r = getCircleRadius(node.name)
                  const isConnectedSelected = selectedNodeIds.has(node.id)
                  const isSelectedCharacter = selectedCharacter?.id === node.id
                  const isDragging =
                    dragStateRef.current.nodeId === node.id && dragStateRef.current.moved

                  const lines =
                    node.name.length > 4
                      ? [node.name.slice(0, 4), node.name.slice(4, 8)]
                      : [node.name]

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      className={`relation-node ${isConnectedSelected ? 'is-related-selected' : ''} ${isSelectedCharacter ? 'is-character-selected' : ''} ${isDragging ? 'is-dragging' : ''}`}
                      onMouseDown={(e) => beginNodeDrag(e, node)}
                      onClick={(e) => handleNodeClick(e, node)}
                    >
                      <circle r={r} className="relation-node-circle" />
                      {lines.length === 1 ? (
                        <text textAnchor="middle" y="5" className="relation-node__label">
                          {lines[0]}
                        </text>
                      ) : (
                        <>
                          <text textAnchor="middle" y="-3" className="relation-node__label">
                            {lines[0]}
                          </text>
                          <text textAnchor="middle" y="15" className="relation-node__label">
                            {lines[1]}
                          </text>
                        </>
                      )}
                    </g>
                  )
                })}
              </svg>
            </div>
          )}
        </PanelCard>
      </main>

      <aside className="relationship-graph-right-col">
        <PanelCard className="mini-panel mini-panel--character-detail">
          <SectionTitle title="人物详情" desc="点击人物节点查看" />
          <div className="mini-panel__body">
            {selectedCharacter ? (
              <div className="character-detail">
                <div className="character-detail__name">
                  {getCharacterName(selectedCharacter)}
                </div>
                <div className="character-detail__meta">
                  关联关系数：{selectedCharacterRelations.length}
                </div>

                <div className="character-rel-list">
                  {selectedCharacterRelations.length ? (
                    selectedCharacterRelations.map((rel) => {
                      const isActive = selectedEdge?.id === rel.id
                      return (
                        <button
                          key={rel.id}
                          type="button"
                          className={`character-rel-card ${isActive ? 'active' : ''}`}
                          onClick={() =>
                            handleEdgeSelect(
                              rel,
                              { name: rel.source_name },
                              { name: rel.target_name }
                            )
                          }
                        >
                          <div className="character-rel-card__title">
                            {`${rel.source_name || '未知角色'} → ${rel.target_name || '未知角色'}`}
                          </div>
                          <div className="character-rel-meta-list">
                            <div className="character-rel-meta-item">
                              <span className="character-rel-meta-item__label">类型：</span>
                              <span className="character-rel-meta-item__value">
                                {rel.relation_type || '未命名关系'}
                              </span>
                            </div>
                            <div className="character-rel-meta-item">
                              <span className="character-rel-meta-item__label">强度：</span>
                              <span className="character-rel-meta-item__value">
                                {rel.relation_value ?? 0}
                              </span>
                            </div>
                            <div className="character-rel-meta-item character-rel-meta-item--block">
                              <span className="character-rel-meta-item__label">描述：</span>
                              <span className="character-rel-meta-item__value">
                                {rel.description || '暂无描述'}
                              </span>
                            </div>
                          </div>
                        </button>
                      )
                    })
                  ) : (
                    <EmptyState text="该人物暂无关联关系" />
                  )}
                </div>
              </div>
            ) : (
              <EmptyState text="请选择一个人物节点" />
            )}
          </div>
        </PanelCard>

        <PanelCard className="mini-panel mini-panel--relation-detail">
          <SectionTitle title="关系详情" desc="点击关系线查看" />
          <div className="mini-panel__body">
            {selectedEdge ? (
              <div className="kv-list">
                <div className="kv-item">
                  <strong>关系方向</strong>
                  {selectedEdge.source_name} → {selectedEdge.target_name}
                </div>
                <div className="kv-item">
                  <strong>关系类型</strong>
                  {selectedEdge.relation_type || '未设定'}
                </div>
                <div className="kv-item">
                  <strong>关系数值</strong>
                  {selectedEdge.relation_value ?? 0}
                </div>
                <div className="kv-item">
                  <strong>描述</strong>
                  {selectedEdge.description || '暂无描述'}
                </div>
              </div>
            ) : (
              <EmptyState text="请点击关系线查看详细信息" />
            )}
          </div>
        </PanelCard>
      </aside>
    </div>
  )
}