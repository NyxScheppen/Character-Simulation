export default function MessageList({ messages = [] }) {
  return (
    <div className="chat-messages">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`msg ${msg.role === 'user' ? 'msg--user' : 'msg--ai'}`}
        >
          {msg.content}
        </div>
      ))}
    </div>
  )
}