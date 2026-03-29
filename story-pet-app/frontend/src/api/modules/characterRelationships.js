import request from '../request'

export function getCharacterRelationships(params = {}) {
  return request.get('/character-relationships/', { params }).then((res) => res.data)
}

export function createCharacterRelationship(payload) {
  return request.post('/character-relationships/', payload).then((res) => res.data)
}

export function updateCharacterRelationship(id, payload) {
  return request.put(`/character-relationships/${id}`, payload).then((res) => res.data)
}

export function deleteCharacterRelationship(id) {
  return request.delete(`/character-relationships/${id}`).then((res) => res.data)
}