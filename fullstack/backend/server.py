from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Dict

app = FastAPI()

# Store active connections
class ConnectionManager:
    def __init__(self):
        self.active_rooms: Dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.active_rooms:
            self.active_rooms[room_id] = []
        self.active_rooms[room_id].append(websocket)

    async def disconnect(self, websocket: WebSocket, room_id: str):
        self.active_rooms[room_id].remove(websocket)
        if not self.active_rooms[room_id]:
            del self.active_rooms[room_id]

    async def broadcast(self, message: dict, room_id: str):
        for connection in self.active_rooms[room_id]:
            await connection.send_json(message)

manager = ConnectionManager()

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await manager.connect(websocket, room_id)
    try:
        while True:
            data = await websocket.receive_json()
            await manager.broadcast({"action": data["action"], "data": data["data"]}, room_id)
    except WebSocketDisconnect:
        await manager.disconnect(websocket, room_id)
        await manager.broadcast({"action": "player_disconnect", "data": None}, room_id)ad=True)
