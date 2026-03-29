import request from '../request'

export function getCharacters(params = {}) {
  return request.get('/characters/', { params }).then((res) => res.data)
}

export function createCharacter(payload) {
  return request.post('/characters/', payload).then((res) => res.data)
}

export function updateCharacter(id, payload) {
  return request.put(`/characters/${id}`, payload).then((res) => res.data)
}

export function deleteCharacter(id) {
  return request.delete(`/characters/${id}`).then((res) => res.data)
}