from pydantic import BaseModel

class BatchSaveRequest(BaseModel):
    fruit_type: str
    pass_rate: float
