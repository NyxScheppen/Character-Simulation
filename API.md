# API 文档

## node
### GET /nodes/?wordline_id
获取特定世界线的故事节点，如无，获取全部故事节点
### GET /nodes/{node_id}
获取特定故事节点
### POST /nodes/
新建故事节点
### PUT /nodes/{node_id}
修改故事节点
### DELETE /nodes/{node_id}
删除故事节点
### POST /nodes/{node_id}/branch
从故事节点延伸出新的故事线
### GET nodes/{node_id}/relationship_graph
获取关系图

## session
### POST /sessions/
新建对话
### GET /sessions/{session_id}/messages
获取特定对话

## wordline
### GET /worldlines/
获取全部的世界线
### GET /worldlines/{worldline_id}
获取特定世界线
### POST /worldlines/
新建世界线
### PUT /worldlines/{worldline_id}
更改世界线
### DELETE /wordlines/{worldline_id}
删除世界线

## chat
### POST /chat/
聊天接口

## characters
### GET /characters/
获取角色列表
### GET /characters/{character_id}
获取特定角色
### POST /characters/
新建角色
### PUT /characters/{character_id}
更改角色
### DELETE /characters/{character_id}
删除角色

## character_state
### GET /character-states/
获取全部角色状态
### GET /character-states/{state_id}
获取特定角色状态
### POST /character-states/
新增角色状态
### PUT /character-states/{state_id}
更改角色状态
### DELETE /character-states/{state_id}
删除角色状态
### GET /character-state/by-character/{character_id}
获取角色全部状态

## character_relationship
### GET /character_relationships/
获取角色全部角色关系
### GET /character_relationships/{relationship_id}
获取特定角色关系
### POST /character_relationships/
新增角色关系
### PUT /character_relationships/{relationship_id}
更改角色关系
### DELETE /character_relationships/{relationship_id}
删除角色关系
### GET /character_relationships/by-character/{character_id}