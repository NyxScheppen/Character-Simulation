import request from '../request'

export function sendChatMessage(payload) {
  return request.post('/chat/', payload).then((res) => res.data)
}