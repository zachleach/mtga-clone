import pprint
import uuid
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from typing import Dict
import json
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from bulk_query import ScryfallDeckUtils

app = FastAPI()
active_connections: Dict[str, WebSocket] = {}
game_state = {}
server_version = 0

# enable CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def broadcast_state_update():
    global server_version
    for connection in active_connections.values():
        await connection.send_json({
            "type": "state_update",
            "game_state": game_state,
            "version": server_version
        })


'''
    if client version matches server version:
        replace state with client version
        increment version counter

'''
async def attempt_state_update(state, client_version):
    global server_version
    if (client_version != server_version):
        return
    game_state.clear()
    game_state.update(state)
    server_version += 1


'''
    add player's initial data to server game state (mutually exclusive operation)
    increment version counter

'''
async def add_player(username, initial_data):
    global server_version
    game_state[username] = initial_data
    server_version += 1


'''
    remove player from game_state and active_connections (mutually exclusive operation
    increment version counter

'''
async def remove_player(username):
    global server_version
    del active_connections[username]
    del game_state[username]
    server_version += 1


@app.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    await websocket.accept()
    active_connections[username] = websocket

    try:
        request = await websocket.receive_json()
        if (request['type'] == 'connection'):
            await add_player(username, request[username])
            await broadcast_state_update()

        while True:
            request = await websocket.receive_json()
            if 'type' not in request: 
                continue

            match request['type']:
                case 'state_update':
                    await attempt_state_update(request['game_state'], request['client_version'])
                    await broadcast_state_update()

                case _:
                    print(request)

    except WebSocketDisconnect:
        await remove_player(username)
        await broadcast_state_update()


# serve static frontend files for production deployment (must be last - catch-all route)
app.mount("/", StaticFiles(directory="dist", html=True), name="static")


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

'''
                case 'StackClickEvent':
                    print('StackClickEvent')
                    stack_uuid = data['uuid']
                    for username in game_state:
                        for row_name in ['hand_row', 'top_row', 'left_row', 'right_row']:
                            row = game_state[username][row_name]
                            for stack in row['stacks']:
                                if stack['uuid'] == stack_uuid:
                                    stack['is_tapped'] = not stack['is_tapped']
                                    break

'''
