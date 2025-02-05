import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import cv2
import base64
import asyncio
import websockets
import json
import os
from typing import Dict, Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    raise RuntimeError("Could not open camera")

shared_string = "Initial Value"
coordinates = {"x": 0.0, "y": 0.0, "z": 0.0}

class DeviceWebSocket:
    def __init__(self):
        self.image_folder = "/home/bob/Desktop/sapienrobotics/test_panoptic_datumaor_v1/images"
        self.image_files = sorted([f for f in os.listdir(self.image_folder) if f.endswith((".png", ".jpg"))])
        self.current_image_index = 0
        self.current_mode = "auto"
        self.current_status = "stop"
        self.websocket: Optional[websockets.WebSocketClientProtocol] = None
        self.is_connected = False
        
    async def load_current_image(self):
        """Load current image synchronously"""
        try:
            image_path = os.path.join(self.image_folder, self.image_files[self.current_image_index])
            with open(image_path, "rb") as image_file:
                image_data = image_file.read()
                return base64.b64encode(image_data).decode("utf-8")
        except Exception as e:
            print(f"Error loading image: {e}")
            return None

    async def connect(self):
        """Establish WebSocket connection"""
        try:
            uri = "ws://localhost:8000/ws/device"
            self.websocket = await websockets.connect(uri)
            self.is_connected = True
            print("Successfully connected to server")
            return True
        except Exception as e:
            print(f"Connection failed: {e}")
            self.is_connected = False
            return False

    async def start_connection(self):
        """Main connection handler"""
        while True:
            if not self.is_connected:
                connected = await self.connect()
                if not connected:
                    await asyncio.sleep(5)
                    continue

            try:
                # Load and send initial image
                encoded_image = await self.load_current_image()
                if encoded_image:
                    message = {
                        "type": "image_update",
                        "image": encoded_image,
                        "points": [{"x": 0.564, "y": 0.317}, {"x": 0.75, "y": 0.6}] if self.current_mode == "auto" else []
                    }
                    await self.websocket.send(json.dumps(message))
                    print(f"Sent image: {self.image_files[self.current_image_index]}")
                
                # Handle incoming messages
                async for message in self.websocket:
                    try:
                        data = json.loads(message)
                        print(f"Received message: {data['type']}")
                        
                        if data["type"] == "confirm_points":
                            await self.handle_point_confirmation(data["points"])
                        elif data["type"] == "mode_change":
                            await self.handle_mode_change(data["mode"])
                        elif data["type"] == "status_change":
                            await self.handle_status_change(data["status"])
                            
                    except json.JSONDecodeError:
                        print("Received invalid JSON")
                        continue
                        
            except websockets.exceptions.ConnectionClosed:
                print("Connection closed. Reconnecting...")
                self.is_connected = False
            except Exception as e:
                print(f"Error in connection: {e}")
                self.is_connected = False
            
            await asyncio.sleep(1)

    async def handle_point_confirmation(self, points):
        """Handle confirmed points from frontend"""
        try:
            print("\nConfirmed Points:")
            for i, point in enumerate(points, 1):
                print(f"Point {i}: X: {point['x']:.3f}, Y: {point['y']:.3f}")
            
            # Move to next image
            self.current_image_index = (self.current_image_index + 1) % len(self.image_files)
            
            # Send new image
            encoded_image = await self.load_current_image()
            if encoded_image and self.websocket:
                message = {
                    "type": "image_update",
                    "image": encoded_image,
                    "points": [{"x": 0.564, "y": 0.317}, {"x": 0.75, "y": 0.6}] if self.current_mode == "auto" else []
                }
                await self.websocket.send(json.dumps(message))
                print(f"Sent next image: {self.image_files[self.current_image_index]}")
                
        except Exception as e:
            print(f"Error handling point confirmation: {e}")

    async def handle_mode_change(self, mode):
        """Handle mode change request"""
        self.current_mode = mode
        print(f"Mode changed to: {mode.upper()}")

    async def handle_status_change(self, status):
        """Handle mode change request"""
        self.current_status = status
        print(f"Status changed to: {status.upper()}")
        
        # Resend current image with updated points based on new mode
        encoded_image = await self.load_current_image()
        if encoded_image and self.websocket:
            message = {
                "type": "image_update",
                "image": encoded_image,
                "points": [{"x": 0.564, "y": 0.317}, {"x": 0.75, "y": 0.6}] if self.current_mode == "auto" else []
            }
            await self.websocket.send(json.dumps(message))

async def stream_camera():
    """WebSocket connection to send camera frame data to the main server."""
    uri = "ws://localhost:8000/ws"
    while True:
        try:
            async with websockets.connect(uri) as websocket:
                print("Camera streaming connection established")
                while True:
                    ret, frame = cap.read()
                    if not ret:
                        print("Failed to capture frame")
                        break
                    
                    # Encode frame
                    _, buffer = cv2.imencode('.jpg', frame)
                    frame_data = base64.b64encode(buffer).decode('utf-8')
                    
                    # Prepare and send payload
                    payload = {
                        "frame": frame_data,
                        "string_data": shared_string,
                        "coordinates": coordinates
                    }
                    await websocket.send(json.dumps(payload))
                    await asyncio.sleep(0.033)  # ~30 fps
                    
        except websockets.exceptions.ConnectionClosed:
            print("Camera streaming connection closed. Attempting to reconnect...")
        except Exception as e:
            print(f"Camera WebSocket error: {e}")
        
        await asyncio.sleep(5)  # Wait before attempting to reconnect

# Create global device instance
device = DeviceWebSocket()

@app.on_event("startup")
async def startup_event():
    """Startup event handler"""
    # Start both the device connection and camera streaming
    asyncio.create_task(device.start_connection())
    asyncio.create_task(stream_camera())

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)