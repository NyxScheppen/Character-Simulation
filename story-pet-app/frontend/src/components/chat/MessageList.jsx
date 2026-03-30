import { useEffect, useRef } from 'react'

export default function MessageList({ messages = [] }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return
    containerRef.current.scrollTop = containerRef.current.scrollHeight
  }, [messages])

  return (
    <div className="chat-messages" ref={containerRef}>
      {messages.map((msg) => {
        if (msg.loading) {
          return (
            <div key={msg.id} className="msg msg--ai msg--loading">
              <span className="loading-dots" aria-label="加载中">
                <span />
                <span />
                <span />
              </span>
            </div>
          )
        }

        return (
          <div
            key={msg.id}
            className={`msg ${msg.role === 'user' ? 'msg--user' : 'msg--ai'}`}
          >
            {msg.content}
          </div>
        )
      })}
    </div>
  )
}