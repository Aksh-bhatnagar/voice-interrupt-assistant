from pydantic import BaseModel


class TurnRequest(BaseModel):
    turn_id: str
    message: str


class TurnResponse(BaseModel):
    turn_id: str
    answer: str


class CancelTurnRequest(BaseModel):
    turn_id: str


class CancelTurnResponse(BaseModel):
    turn_id: str
    cancelled: bool