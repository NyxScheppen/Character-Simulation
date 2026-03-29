import request from '../request'

export function getSessionMessages(sessionId) {
  return request.get(`/sessions/${sessionId}/messages`).then((res) => res.data)
}