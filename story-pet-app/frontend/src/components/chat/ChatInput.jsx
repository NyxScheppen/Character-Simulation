import { useState } from 'react'

export default function ChatInput({ onSend, disabled = false }) {
  const [text, setText] = useState('')

  const handleSend = () => {
    const value = text.trim()
    if (!value) return
    onSend?.(value)
    setText('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-input">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="请输入消息"
        disabled={disabled}
      />
      <button type="button" onClick={handleSend} disabled={disabled}>
        发送信息
      </button>
    </div>
  )
}