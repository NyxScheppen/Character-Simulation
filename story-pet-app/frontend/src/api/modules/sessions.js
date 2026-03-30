import request from '../request'

export function getSessions(params = {}) {
  return request.get('/sessions/', { params }).then((res) => res.data)
}

export function createSession(payload) {
  return request.post('/sessions/', payload).then((res) => res.data)
}

export function deleteSession(id) {
  return request.delete(`/sessions/${id}`).then((res) => res.data)
}