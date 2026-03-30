import { useEffect, useMemo, useState } from 'react'
import PanelCard from '../components/common/PanelCard'
import SectionTitle from '../components/common/SectionTitle'
import SessionList from '../components/chat/SessionList'
import CreateSessionModal from '../components/chat/CreateSessionModal'
import MessageList from '../components/chat/MessageList'
import ChatInput from '../components/chat/ChatInput'
import {
  getSessions,
  createSession,
  deleteSession,
  getSessionMessages,
  sendChatMessage,
  getStatesByCharacter,
  createCharacterState,
} from '../api'

export default function ChatPage() {
  const [sessions, setSessions] = useState([])
  const [activeSession, setActiveSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [createOpen, setCreateOpen] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadSessions()
  }, [])

  useEffect(() => {
    if (!activeSession?.id) {
      setMessages([])
      return
    }
    loadMessages(activeSession.id)
  }, [activeSession])

  async function loadSessions() {
    try {
      const data = await getSessions()
      const list = Array.isArray(data) ? data : []
      setSessions(list)
      if (list.length) setActiveSession(list[0])
      else setActiveSession(null)
    } catch (err) {
      console.error(err)
      setSessions([])
      setActiveSession(null)
    }
  }

  async function loadMessages(sessionId) {
    try {
      const data = await getSessionMessages(sessionId)
      const list = Array.isArray(data) ? data : []
      const normalized = list.map((item, index) => ({
        id: item.id || `msg-${index}`,
        role: item.role || item.sender || 'assistant',
        content: item.content || item.message || '',
      }))
      setMessages(normalized)
    } catch (err) {
      console.error(err)
      setMessages([])
    }
  }

  const chatTitle = useMemo(
    () => activeSession?.title || '未选择会话',
    [activeSession]
  )

  const chatDesc = useMemo(() => {
    if (!activeSession) return '对话工作区'
    return `对话工作区 · 你扮演：${activeSession.user_role || '未填写'}`
  }, [activeSession])

  const displayMessages = useMemo(() => {
    if (!sending) return messages
    return [
      ...messages,
      {
        id: 'loading-message',
        role: 'assistant',
        content: '',
        loading: true,
      },
    ]
  }, [messages, sending])

  async function ensureCharacterState(characterId, storyNodeId) {
    const existed = await getStatesByCharacter(characterId, { story_node_id: storyNodeId })
    const list = Array.isArray(existed) ? existed : []
    if (list.length) return list[0]

    return await createCharacterState({
      character_id: characterId,
      story_node_id: storyNodeId,
      mental_state: '',
      current_goal: '',
      prompt_override: '',
      relation_summary: '',
      profession: '',
      age: null,
      location: '',
    })
  }

  const handleCreateSession = async ({
    character_id,
    story_node_id,
    title,
    user_role,
  }) => {
    try {
      const state = await ensureCharacterState(character_id, story_node_id)
      const created = await createSession({
        character_state_id: state.id,
        title: title || 'New Session',
        user_role: user_role || '',
      })
      setSessions((prev) => [created, ...prev])
      setActiveSession(created)
      setCreateOpen(false)
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.detail || '创建会话失败')
    }
  }

  const handleDeleteSession = async (item) => {
    const ok = window.confirm(`确定删除会话「${item.title || '未命名会话'}」吗？`)
    if (!ok) return

    try {
      await deleteSession(item.id)
      const next = sessions.filter((x) => x.id !== item.id)
      setSessions(next)

      if (activeSession?.id === item.id) {
        setActiveSession(next[0] || null)
      }
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.detail || '删除会话失败')
    }
  }

  const handleSend = async (text) => {
    if (!activeSession?.id) {
      alert('请先创建或选择一个会话')
      return
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    }

    setMessages((prev) => [...prev, userMessage])
    setSending(true)

    try {
      const res = await sendChatMessage({
        session_id: activeSession.id,
        message: text,
      })

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: res?.reply || '接口未返回 reply',
        },
      ])
    } catch (err) {
      console.error(err)
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: err?.response?.data?.detail || '发送失败',
        },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <div className="chat-page chat-page--simple">
        <div className="chat-page__sidebar">
          <SessionList
            sessions={sessions}
            activeSessionId={activeSession?.id}
            onSelect={setActiveSession}
            onCreate={() => setCreateOpen(true)}
            onDelete={handleDeleteSession}
          />
        </div>

        <PanelCard strong className="chat-main chat-main--bottom">
          <div className="chat-header">
            <SectionTitle title={chatTitle} desc={chatDesc} />
          </div>

          <MessageList messages={displayMessages} />

          <ChatInput onSend={handleSend} disabled={sending} />
        </PanelCard>
      </div>

      <CreateSessionModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onConfirm={handleCreateSession}
      />
    </>
  )
}