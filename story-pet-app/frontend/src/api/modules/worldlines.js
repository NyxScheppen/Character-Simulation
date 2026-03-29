import request from '../request'

export function getWorldlines(params = {}) {
  return request.get('/worldlines/', { params }).then((res) => res.data)
}

export function createWorldline(payload) {
  return request.post('/worldlines/', payload).then((res) => res.data)
}

export function deleteWorldline(id) {
  return request.delete(`/worldlines/${id}`).then((res) => res.data)
}