from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.turn import router as turn_router
from app.routes.stt import router as stt_router
from app.routes.tts import router as tts_router


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
app.include_router(stt_router)
app.include_router(tts_router)


@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "Voice interrupt assistant backend is running"
    }
#venv\Scripts\activate
#python -m uvicorn app.main:app --reload --port 8000
#python -m uvicorn main:app --reload --port 8000