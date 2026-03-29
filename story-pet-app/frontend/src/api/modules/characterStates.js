import request from '../request'

export function getCharacterStates(params = {}) {
  return request.get('/character-states/', { params }).then((res) => res.data)
}

export function getStatesByCharacter(characterId, params = {}) {
  return request
    .get(`/character-states/by-character/${characterId}`, { params })
    .then((res) => res.data)
}

export function createCharacterState(payload) {
  return request.post('/character-states/', payload).then((res) => res.data)
}

export function deleteCharacterState(id) {
  return request.delete(`/character-states/${id}`).then((res) => res.data)
}