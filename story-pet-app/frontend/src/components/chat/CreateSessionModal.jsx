import { useEffect, useMemo, useState } from 'react'
import Modal from '../common/Modal'
import {
  getCharacters,
  getWorldlines,
  getStoryNodes,
  getStatesByCharacter,
} from '../../api'

export default function CreateSessionModal({
  open,
  onClose,
  onConfirm,
}) {
  const [worldlines, setWorldlines] = useState([])
  const [characters, setCharacters] = useState([])
  const [nodes, setNodes] = useState([])

  const [worldlineId, setWorldlineId] = useState('')
  const [characterId, setCharacterId] = useState('')
  const [nodeId, setNodeId] = useState('')

  useEffect(() => {
    if (!open) return

    async function init() {
      try {
        const [worldlineData, characterData] = await Promise.all([
          getWorldlines(),
          getCharacters(),
        ])
        setWorldlines(Array.isArray(worldlineData) ? worldlineData : [])
        setCharacters(Array.isArray(characterData) ? characterData : [])
      } catch (err) {
        console.error(err)
      }
    }

    init()
  }, [open])

  useEffect(() => {
    if (!worldlineId) {
      setNodes([])
      setNodeId('')
      return
    }

    async function loadNodes() {
      try {
        const data = await getStoryNodes({ worldline_id: worldlineId })
        setNodes(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
        setNodes([])
      }
    }

    loadNodes()
  }, [worldlineId])

  const selectedCharacter = useMemo(
    () => characters.find((c) => String(c.id) === String(characterId)),
    [characters, characterId]
  )

  const selectedNode = useMemo(
    () => nodes.find((n) => String(n.id) === String(nodeId)),
    [nodes, nodeId]
  )

  const handleConfirm = async () => {
    if (!worldlineId || !characterId || !nodeId) {
      alert('请先选择世界线、角色和节点')
      return
    }

    await onConfirm?.({
      worldline_id: Number(worldlineId),
      character_id: Number(characterId),
      story_node_id: Number(nodeId),
      title: `${selectedCharacter?.name || '角色'} · ${selectedNode?.title || '节点'}`
    })
  }

  return (
    <Modal
      open={open}
      title="新建会话"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="mini-btn" onClick={onClose}>取消</button>
          <button type="button" className="mini-btn" onClick={handleConfirm}>创建</button>
        </>
      }
    >
      <div className="form-grid">
        <div className="form-field">
          <label>选择世界线</label>
          <select value={worldlineId} onChange={(e) => setWorldlineId(e.target.value)}>
            <option value="">请选择世界线</option>
            {worldlines.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>选择角色</label>
          <select value={characterId} onChange={(e) => setCharacterId(e.target.value)}>
            <option value="">请选择角色</option>
            {characters.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>选择节点</label>
          <select value={nodeId} onChange={(e) => setNodeId(e.target.value)} disabled={!worldlineId}>
            <option value="">请选择节点</option>
            {nodes.map((item) => (
              <option key={item.id} value={item.id}>{item.title}</option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  )
}