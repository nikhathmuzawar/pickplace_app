from fastapi import APIRouter, BackgroundTasks
from fastapi import HTTPException
from fastapi.responses import RedirectResponse
from models.devices import devices, PromptRequest, ManufRequest
from config.database import collection_name
from schema.schemas import list_seriral
from bson import ObjectId


router = APIRouter()

@router.get("/api/devices")
async def get_devices():
    devs = list_seriral(collection_name.find())
    return devs

@router.post("/")
async def post_device(devices: devices):
    collection_name.insert_one(dict(devices))

@router.put("/api/{id}")
async def put_device(id: str, devices:devices):
    collection_name.find_one_and_update({"_id":ObjectId(id)}, {"$set": dict(devices)})

@router.delete("/api/{id}")
async def delete_device(id: str):
    collection_name.find_one_and_delete({"_id": ObjectId(id)})

@router.get("/api/devices/{id}", response_model=devices)
async def get_device_by_id(id: str):
    device = collection_name.find_one({"_id": ObjectId(id)})
    if device is None:
        raise HTTPException(status_code=404, detail="Device not found")
    return serialize_dict(device)  

"""@router.post("/prompt")
async def process_prompt(request: PromptRequest):
    input_string = request.input
    response_string = f"Placing red cube in blue bowl, yellow cube in yellow bowl, green in white bowl."
    return {"message": response_string}"""

@router.get("/api/position")
async def get_position():
    response_pos = f"x:0, Y:0, Z:0"
    response_gripper = f"closed"
    return {"position": response_pos, "gripper": response_gripper}

@router.get("/api/sideView")
async def get_video():
    return " ", 200
    #return RedirectResponse(url=PLACEHOLDER_VIDEO_URL)



"""@router.get("/gripperView")
async def get_video():
    return RedirectResponse(url=PLACEHOLDER_VIDEO_URL)

@router.get("/isometricView")
async def get_video():
    return RedirectResponse(url=PLACEHOLDER_VIDEO_URL)"""

@router.post("/api/manuf")
async def get_manuf(request: ManufRequest):
    manuf=request.firstOption
    ver=request.secondOption
    response=f"manufacture: {manuf}, version: {ver}"
    return {"message": response}

def serialize_dict(a) -> dict:
    return {str(i): str(a[i]) if i == "_id" else a[i] for i in a}

