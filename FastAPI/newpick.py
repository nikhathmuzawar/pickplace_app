import base64
import asyncio
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from routes.router import router
from typing import Dict, Optional, List
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()
app.include_router(router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

latest_frame = None
latest_string = None
latest_coordinates = None
coordinates_string = "x:0 y:0 z:0"  # String format for coordinates
client_websocket = None 

def update_coordinates_string(coords):
    """Convert coordinates dictionary to formatted string."""
    global coordinates_string
    if coords and isinstance(coords, dict):
        coordinates_string = f"x:{coords['x']:.2f} y:{coords['y']:.2f} z:{coords['z']:.2f}"

async def generate_frames():
    """Generate video frames from the latest frame received."""
    global latest_frame
    while True:
        if latest_frame:
            yield (b'--frame\r\n'   
                   b'Content-Type: image/jpeg\r\n\r\n' + base64.b64decode(latest_frame) + b'\r\n')
        await asyncio.sleep(0.033)  # ~30 fps

class Point(BaseModel):
    x: float
    y: float

class PointsData(BaseModel):
    points: List[Point]

class ModeChangeRequest(BaseModel):
    mode: str

class StatusChangeRequest(BaseModel):
    status: str

class ConnectionManager:
    def __init__(self):
        self.device_connection: Optional[WebSocket] = None
        self.client_connections: Dict[str, WebSocket] = {}
        self.current_image: Optional[str] = None
        self.current_points: List[dict] = []
        
    async def connect_device(self, websocket: WebSocket):
        await websocket.accept()
        self.device_connection = websocket
        print("Device connected")
            
    async def disconnect_device(self):
        self.device_connection = None
        print("Device disconnected")
            
    async def connect_client(self, websocket: WebSocket):
        await websocket.accept()
        client_id = id(websocket)
        self.client_connections[client_id] = websocket
        
        # Send current image and points if available
        if self.current_image:
            await websocket.send_json({
                "type": "image_update",
                "image": self.current_image,
                "points": self.current_points
            })
        return client_id
        
    async def disconnect_client(self, client_id: str):
        if client_id in self.client_connections:
            del self.client_connections[client_id]

    async def broadcast_to_clients(self, message: dict):
        """Broadcast message to all connected clients"""
        if message.get("type") == "image_update":
            self.current_image = message.get("image")
            self.current_points = message.get("points", [])
            
        disconnected = []
        for client_id, websocket in self.client_connections.items():
            try:
                await websocket.send_json(message)
            except Exception:
                disconnected.append(client_id)
        
        for client_id in disconnected:
            await self.disconnect_client(client_id)

# Initialize connection manager
manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Handle WebSocket connection for receiving frames, strings, and coordinates."""
    await websocket.accept()
    global latest_frame, latest_string, latest_coordinates
    try:
        while True:
            data = await websocket.receive_text()
            try:
                json_data = json.loads(data)
                if isinstance(json_data, dict):
                    if "frame" in json_data:
                        latest_frame = json_data["frame"]
                    if "string_data" in json_data:
                        latest_string = json_data["string_data"]
                    if "coordinates" in json_data:
                        latest_coordinates = json_data["coordinates"]
                        update_coordinates_string(latest_coordinates)
                else:
                    latest_frame = data
            except json.JSONDecodeError:
                latest_frame = data
    except Exception as e:
        print(f"WebSocket error: {e}")

@app.websocket("/ws/device")
async def device_websocket_endpoint(websocket: WebSocket):
    await manager.connect_device(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                await manager.broadcast_to_clients(message)
            except json.JSONDecodeError:
                print("Invalid JSON received from device")
    except WebSocketDisconnect:
        await manager.disconnect_device()
    except Exception as e:
        print(f"Device WebSocket error: {e}")
        await manager.disconnect_device()

@app.websocket("/ws/client/{client_id}")
async def client_websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect_client(websocket)
    try:
        while True:
            await websocket.receive_text()  # Keep connection alive
    except WebSocketDisconnect:
        await manager.disconnect_client(client_id)

@app.post("/api/confirm-points")
async def confirm_points(points_data: PointsData):
    if not manager.device_connection:
        raise HTTPException(status_code=503, detail="Device not connected")
    
    try:
        # Validate points
        for point in points_data.points:
            if not (0 <= point.x <= 1 and 0 <= point.y <= 1):
                raise HTTPException(
                    status_code=400,
                    detail="Points must be normalized (between 0 and 1)"
                )

        # Send points to device
        await manager.device_connection.send_json({
            "type": "confirm_points",
            "points": [{"x": p.x, "y": p.y} for p in points_data.points]
        })
        
        return {"message": "Points sent to device successfully"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/mode")
async def change_mode(request: ModeChangeRequest):
    if request.mode not in ["manual", "auto"]:
        raise HTTPException(status_code=400, detail="Invalid mode")
    
    if not manager.device_connection:
        raise HTTPException(status_code=503, detail="Device not connected")
        
    try:
        await manager.device_connection.send_json({
            "type": "mode_change",
            "mode": request.mode
        })
        return {"message": f"Mode changed to {request.mode}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/api/status")
async def change_status(request: StatusChangeRequest):
    if request.status not in ["start", "stop"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    if not manager.device_connection:
        raise HTTPException(status_code=503, detail="Device not connected")
        
    try:
        await manager.device_connection.send_json({
            "type": "status_change",
            "status": request.status
        })
        return {"message": f"Status changed to {request.status}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/api/video_feed")
async def video_feed():
    """Streaming endpoint for video feed."""
    return StreamingResponse(generate_frames(), media_type='multipart/x-mixed-replace; boundary=frame')

@app.get("/api/image-data")
async def get_image_data():
    """HTTP endpoint for frontend to get current image and points"""
    if not manager.current_image:
        raise HTTPException(status_code=404, detail="No image available")
    return {
        "image": manager.current_image,
        "points": manager.current_points
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)