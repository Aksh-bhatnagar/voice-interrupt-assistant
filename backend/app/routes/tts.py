import os
import tempfile

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from groq import Groq

router = APIRouter(prefix="/api", tags=["tts"])

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise RuntimeError("GROQ_API_KEY was not loaded")

client = Groq(api_key=api_key)

TTS_MODEL = "canopylabs/orpheus-v1-english"
TTS_VOICE = "troy"


class TTSRequest(BaseModel):
    text: str


@router.post("/tts")
async def text_to_speech(request: TTSRequest):

    text = request.text.strip()

    if not text:
        raise HTTPException(
            status_code=400,
            detail="Text is required"
        )

    # Orpheus maximum input is 200 characters.
    text = text[:200]

    temp_path = None

    try:
        print(f"[TTS] Generating: {text}")
        print(f"[TTS] Characters: {len(text)}")

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".wav"
        ) as temp_file:
            temp_path = temp_file.name

        response = client.audio.speech.create(
            model=TTS_MODEL,
            voice=TTS_VOICE,
            input=text,
            response_format="wav"
        )

        response.write_to_file(temp_path)

        file_size = os.path.getsize(temp_path)

        print(f"[TTS] Generated: {file_size} bytes")

        return FileResponse(
            temp_path,
            media_type="audio/wav",
            filename="speech.wav",
            headers={
                "Cache-Control": "no-store"
            }
        )

    except Exception as error:

        print(
            f"[TTS] ERROR: {type(error).__name__}: {error}"
        )

        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )