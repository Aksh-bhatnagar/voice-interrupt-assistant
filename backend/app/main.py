from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.turn import router as turn_router

app = FastAPI(
    title="Voice Interrupt Assistant API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(turn_router)


@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "Voice Interrupt Assistant backend is running"
    }

#python -m uvicorn main:app --reload --port 8000