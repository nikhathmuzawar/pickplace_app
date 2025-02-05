# FastAPI Application Documentation

## Overview

This FastAPI application handles video streaming, WebSocket communication, and device-client interactions. It supports real-time video feeds, point confirmation, mode and status changes, and broadcasting updates to multiple clients.


## Project Structure
```
.
├── main.py              # Main FastAPI application
├── routes/
│   └── router.py        # Additional route definitions
└── requirements.txt     # Python dependencies
```

## Dependencies
- FastAPI
- Uvicorn
- Pydantic
- JSON
- Base64
- Asyncio

Install dependencies:
```bash
pip install fastapi uvicorn pydantic
```

## API Endpoints

### WebSocket Endpoints

1. **Device WebSocket**  
   `ws://<host>/ws/device`
   - Connects a device to the server.
   - Handles real-time data from devices and broadcasts to clients.
   
2. **Client WebSocket**  
   `ws://<host>/ws/client/{client_id}`
   - Connects a client to the server.
   - Receives broadcasts from the device.

3. **General WebSocket**  
   `ws://<host>/ws`
   - Handles real-time updates like frames, strings, and coordinates.

### REST API Endpoints

1. **Video Feed**  
   `GET /api/video_feed`
   - Streams the latest video frames.
   - **Response:** `multipart/x-mixed-replace` stream.

2. **Get Image Data**  
   `GET /api/image-data`
   - Retrieves the current image and associated points.
   - **Response:** JSON with `image` and `points` fields.

3. **Confirm Points**  
   `POST /api/confirm-points`
   - Sends normalized points to the connected device.
   - **Body:** `{ "points": [{"x": 0.5, "y": 0.5}] }`

4. **Change Mode**  
   `POST /api/mode`
   - Changes the device mode between `manual` and `auto`.
   - **Body:** `{ "mode": "manual" }`

5. **Change Status**  
   `POST /api/status`
   - Starts or stops the device.
   - **Body:** `{ "status": "start" }`

## Data Models

1. **Point**
   ```python
   class Point(BaseModel):
       x: float
       y: float
   ```

2. **PointsData**
   ```python
   class PointsData(BaseModel):
       points: List[Point]
   ```

3. **ModeChangeRequest**
   ```python
   class ModeChangeRequest(BaseModel):
       mode: str  # 'manual' or 'auto'
   ```

4. **StatusChangeRequest**
   ```python
   class StatusChangeRequest(BaseModel):
       status: str  # 'start' or 'stop'
   ```

## Classes

### 1. **ConnectionManager**
Handles device and client WebSocket connections.
- **Methods:**
  - `connect_device(websocket)`
  - `disconnect_device()`
  - `connect_client(websocket)`
  - `disconnect_client(client_id)`
  - `broadcast_to_clients(message)`

## Utility Functions

1. **update_coordinates_string(coords)**  
   Converts coordinate dictionaries into formatted strings.

2. **generate_frames()**  
   Generates video frames for streaming (~30 FPS).

## Error Handling
- **503:** Device not connected.
- **400:** Invalid input (e.g., incorrect mode/status).
- **500:** Internal server errors.

## Running the Application


```bash
python3 newpick.py
```

---

## Example WebSocket Usage

```javascript
const socket = new WebSocket("ws://localhost:8000/ws/client/123");

socket.onmessage = function(event) {
    console.log("Message from server:", event.data);
};

socket.onopen = function() {
    console.log("Connected to server");
};

socket.onclose = function() {
    console.log("Disconnected from server");
};
```

---

## Example API Request

```bash
curl -X POST "http://localhost:8000/api/mode" \
     -H "Content-Type: application/json" \
     -d '{"mode": "auto"}'
```

**Response:**
```json
{
  "message": "Mode changed to auto"
}
```

