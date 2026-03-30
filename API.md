# API 文档

## node
### GET /nodes/?worldline_id={worldline_id}
获取特定世界线的故事节点；如不传 `worldline_id`，则获取全部故事节点

### GET /nodes/{node_id}
获取特定故事节点

### POST /nodes/
新建故事节点

### PUT /nodes/{node_id}
修改故事节点

### DELETE /nodes/{node_id}
删除故事节点

### POST /nodes/{node_id}/branch
从某个故事节点延伸出新的分支节点

### GET /nodes/{node_id}/relationship_graph
获取该故事节点下的角色关系图

## session
### GET /sessions/
获取会话列表

支持 query 参数：
- `character_state_id`：按角色状态筛选会话

示例：
- `/sessions/`
- `/sessions/?character_state_id=12`

### POST /sessions/
新建对话会话

### GET /sessions/{session_id}/messages
获取特定会话的消息列表

## worldline
### GET /worldlines/
获取全部世界线

### GET /worldlines/{worldline_id}
获取特定世界线

### POST /worldlines/
新建世界线

### PUT /worldlines/{worldline_id}
修改世界线

### DELETE /worldlines/{worldline_id}
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
修改角色

### DELETE /characters/{character_id}
删除角色

## character_state
### GET /character-states/
获取角色状态列表

支持 query 参数：
- `character_id`：按角色筛选
- `story_node_id`：按故事节点筛选
- `worldline_id`：按世界线筛选（通过故事节点所属世界线过滤）

参数可以组合使用。

示例：
- `/character-states/`
- `/character-states/?character_id=1`
- `/character-states/?story_node_id=10`
- `/character-states/?worldline_id=2`
- `/character-states/?character_id=1&story_node_id=10`

### GET /character-states/{state_id}
获取特定角色状态

### POST /character-states/
新增角色状态

### PUT /character-states/{state_id}
修改角色状态

### DELETE /character-states/{state_id}
删除角色状态

### GET /character-states/by-character/{character_id}
获取某个角色的全部状态

支持 query 参数：
- `story_node_id`：可进一步限制到某个故事节点

示例：
- `/character-states/by-character/1`
- `/character-states/by-character/1?story_node_id=10`

## character_relationship
### GET /character_relationships/
获取全部角色关系

### GET /character_relationships/{relationship_id}
获取特定角色关系

### POST /character_relationships/
新增角色关系

### PUT /character_relationships/{relationship_id}
修改角色关系

### DELETE /character_relationships/{relationship_id}
删除角色关系

### GET /character_relationships/by-character/{character_id}
获取某个角色参与的全部角色关系