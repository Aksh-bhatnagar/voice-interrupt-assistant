import os
import tempfile

from fastapi import APIRouter, UploadFile, File

from app.services.stt import transcribe_audio

router = APIRouter(prefix="/api", tags=["stt"])


@router.post("/stt")
async def speech_to_text(file: UploadFile = File(...)):
    suffix = os.path.splitext(file.filename or "")[1] or ".webm"

    temp_path = None

    try:
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix
        ) as temp_file:
            temp_path = temp_file.name

            content = await file.read()
            temp_file.write(content)

        text = await transcribe_audio(temp_path)

        return {
            "text": text
        }

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)