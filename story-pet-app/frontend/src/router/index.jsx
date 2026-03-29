import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import ChatPage from '../pages/ChatPage'
import WorldlinePage from '../pages/WorldlinePage'
import CharacterPage from '../pages/CharacterPage'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/chat" replace />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/worldlines" element={<WorldlinePage />} />
        <Route path="/characters" element={<CharacterPage />} />
      </Route>
    </Routes>
  )
}