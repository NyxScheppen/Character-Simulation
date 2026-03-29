import request from '../request'

export function getStoryNodes(params = {}) {
  return request.get('/nodes/', { params }).then((res) => res.data)
}

export function getStoryNodeById(id) {
  return request.get(`/nodes/${id}`).then((res) => res.data)
}

export function createStoryNode(payload) {
  return request.post('/nodes/', payload).then((res) => res.data)
}

export function deleteStoryNode(id) {
  return request.delete(`/nodes/${id}`).then((res) => res.data)
}

export function branchNode(nodeId, payload) {
  return request.post(`/nodes/${nodeId}/branch`, payload).then((res) => res.data)
}