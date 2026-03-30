import request from '../request'

export function getNodeRelationshipGraph(nodeId) {
  return request.get(`/nodes/${nodeId}/relationship-graph`).then((res) => res.data)
}