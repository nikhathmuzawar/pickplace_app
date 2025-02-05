from pydantic import BaseModel

class devices(BaseModel):
    name: str
    desc: str
    status: bool
    username: str  
    password: str

class PromptRequest(BaseModel):
    input: str

class ManufRequest(BaseModel):
    firstOption: str
    secondOption: str