def individual_serial(device) -> dict:
    return {
        "id": str(device["_id"]),
        "name": device.get("name", ""),  
        "desc": device.get("desc", ""),
        "status": device.get("status", False),
        "username": device.get("username", "unknown"),  
        "password": device.get("password", "password")  
    }

def list_seriral(devices) -> list:
    return[individual_serial(devices) for devices in devices]
