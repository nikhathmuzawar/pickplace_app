# FastAPI Application Documentation

## Overview

This FastAPI application handles video streaming, WebSocket communication, device-client interactions, and secure user authentication. It supports real-time video feeds, point confirmation, mode and status changes, and broadcasting updates to multiple clients.

---

## Table of Contents
1. [Project Structure](#project-structure)
2. [Dependencies](#dependencies)
3. [API Endpoints](#api-endpoints)
   - [WebSocket Endpoints](#websocket-endpoints)
   - [REST API Endpoints](#rest-api-endpoints)
4. [Data Models](#data-models)
5. [Classes](#classes)
6. [Utility Functions](#utility-functions)
7. [Authentication & Authorization](#authentication--authorization)
8. [Error Handling](#error-handling)
9. [Running the Application](#running-the-application)

---

## Project Structure
```
.
├── main.py              # Main FastAPI application
├── routes/
│   └── router.py        # Additional route definitions
├── auth/
│   └── auth.py          # Authentication routes and logic
```

## Dependencies
- FastAPI
- Uvicorn
- Pydantic
- JSON
- Base64
- Asyncio
- Passlib
- Python-Jose
- Bcrypt

Install dependencies:
```bash
pip install fastapi uvicorn pydantic passlib[bcrypt] python-jose pymongo
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

6. **Authentication**  
   `POST /token`
   - Authenticates a user and returns a JWT access token.
   - **Body:** `username` and `password` (form data).

7. **Device Management (Protected)**
   - `GET /devices` - Retrieve all devices.
   - `POST /` - Add a new device.
   - `PUT /{id}` - Update a device by ID.
   - `DELETE /{id}` - Delete a device by ID.
   - `GET /devices/{id}` - Get a specific device by ID.

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

5. **Device**
   ```python
   class Device(BaseModel):
       name: str
       status: str
       manufacturer: str
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

## Authentication & Authorization

### **Token Generation**
- `POST /token`
- Uses OAuth2 with Password (Bearer) for authentication.
- Returns an access token upon successful login.

### **JWT Helper Functions**
- `verify_password(plain_password, stored_password)`
- `get_password_hash(password)`
- `create_access_token(data, expires_delta)`
- `get_current_user(token)` - Decodes JWT and retrieves the current user.

### **Protected Routes**
- Requires a valid JWT token in the `Authorization` header:
  ```bash
  Authorization: Bearer <token>
  ```

## Error Handling
- **401:** Unauthorized access.
- **404:** Resource not found.
- **503:** Device not connected.
- **400:** Invalid input (e.g., incorrect mode/status).
- **500:** Internal server errors.

## Running the Application

Run using Uvicorn:
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

## Example API Requests

### **Authentication**
```bash
curl -X POST "http://localhost:8000/token" \
     -d "username=test&password=pass"
```

### **Get Devices (Protected)**
```bash
curl -X GET "http://localhost:8000/devices" \
     -H "Authorization: Bearer <your_token>"
```

### **Change Mode**
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

