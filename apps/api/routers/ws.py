import json
import logging
from collections import defaultdict
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger("collab")

router = APIRouter(tags=["Real-time Collaboration"])

class ConnectionManager:
    def __init__(self):
        # document_id -> set of active WebSockets
        self.rooms: dict[str, set[WebSocket]] = defaultdict(set)
        # websocket -> { client_id, user_name, color, cursor_node_id }
        self.client_meta: dict[WebSocket, dict] = {}

    async def connect(self, doc_id: str, websocket: WebSocket):
        await websocket.accept()
        self.rooms[doc_id].add(websocket)
        logger.info(f"Client connected to doc {doc_id}. Total: {len(self.rooms[doc_id])}")

    def disconnect(self, doc_id: str, websocket: WebSocket):
        if websocket in self.rooms[doc_id]:
            self.rooms[doc_id].remove(websocket)
            if not self.rooms[doc_id]:
                del self.rooms[doc_id]
        meta = self.client_meta.pop(websocket, None)
        logger.info(f"Client disconnected from doc {doc_id}.")
        return meta

    async def broadcast(self, doc_id: str, message: dict, sender: WebSocket | None = None):
        dead_sockets = []
        for socket in self.rooms.get(doc_id, []):
            if socket != sender:
                try:
                    await socket.send_json(message)
                except Exception:
                    dead_sockets.append(socket)

        for dead in dead_sockets:
            self.disconnect(doc_id, dead)

manager = ConnectionManager()

@router.websocket("/ws/documents/{doc_id}")
async def document_collaboration_websocket(websocket: WebSocket, doc_id: str):
    await manager.connect(doc_id, websocket)
    try:
        while True:
            raw_text = await websocket.receive_text()
            try:
                msg = json.loads(raw_text)
            except Exception:
                continue

            msg_type = msg.get("type")

            if msg_type == "join":
                manager.client_meta[websocket] = {
                    "clientId": msg.get("clientId"),
                    "userName": msg.get("userName", "Anonymous Writer"),
                    "color": msg.get("color", "#f59e0b"),
                }
                # Broadcast new peer announcement
                await manager.broadcast(
                    doc_id,
                    {
                        "type": "peer_joined",
                        "clientId": msg.get("clientId"),
                        "userName": msg.get("userName"),
                        "color": msg.get("color"),
                    },
                    sender=websocket,
                )

            elif msg_type == "cursor":
                # Broadcast remote cursor position
                meta = manager.client_meta.get(websocket, {})
                await manager.broadcast(
                    doc_id,
                    {
                        "type": "peer_cursor",
                        "clientId": meta.get("clientId"),
                        "userName": meta.get("userName"),
                        "color": meta.get("color"),
                        "nodeId": msg.get("nodeId"),
                        "offset": msg.get("offset", 0),
                    },
                    sender=websocket,
                )

            elif msg_type == "document_update":
                # Broadcast document changes / Yjs updates
                await manager.broadcast(
                    doc_id,
                    {
                        "type": "document_update",
                        "senderId": msg.get("senderId"),
                        "payload": msg.get("payload"),
                    },
                    sender=websocket,
                )

    except WebSocketDisconnect:
        meta = manager.disconnect(doc_id, websocket)
        if meta:
            await manager.broadcast(
                doc_id,
                {
                    "type": "peer_left",
                    "clientId": meta.get("clientId"),
                    "userName": meta.get("userName"),
                },
            )
