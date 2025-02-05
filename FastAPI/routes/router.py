from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from models.devices import devices, PromptRequest, ManufRequest
from schema.schemas import list_seriral
from bson import ObjectId
from config.database import collection_name
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta

# Security configuration
SECRET_KEY = "your-secret-key" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

router = APIRouter()

def serialize_dict(a) -> dict:
    return {str(i): str(a[i]) if i == "_id" else a[i] for i in a}


# Helper functions for password and JWT
def verify_password(plain_password: str, stored_password: str) -> bool:
    return plain_password == stored_password

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Mock user retrieval from the database
def get_user(username: str):
    user = collection_name.find_one({"username": username})
    if user:
        return serialize_dict(user)
    return None

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        user = get_user(username)
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Routes
@router.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = get_user(form_data.username)
    if not user or "password" not in user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if not verify_password(form_data.password, user["password"]):  # Plain-text comparison
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/devices", dependencies=[Depends(get_current_user)])
async def get_devices():
    devs = list_seriral(collection_name.find())
    return devs

@router.post("/", dependencies=[Depends(get_current_user)])
async def post_device(devices: devices):
    collection_name.insert_one(dict(devices))

@router.put("/{id}", dependencies=[Depends(get_current_user)])
async def put_device(id: str, devices: devices):
    collection_name.find_one_and_update({"_id": ObjectId(id)}, {"$set": dict(devices)})

@router.delete("/{id}", dependencies=[Depends(get_current_user)])
async def delete_device(id: str):
    collection_name.find_one_and_delete({"_id": ObjectId(id)})

@router.get("/devices/{id}", response_model=devices, dependencies=[Depends(get_current_user)])
async def get_device_by_id(id: str):
    device = collection_name.find_one({"_id": ObjectId(id)})
    if device is None:
        raise HTTPException(status_code=404, detail="Device not found")
    return serialize_dict(device)
