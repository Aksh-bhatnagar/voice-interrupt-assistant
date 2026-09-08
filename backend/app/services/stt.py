import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise RuntimeError("GROQ_API_KEY was not loaded")

client = Groq(api_key=api_key)


def transcribe_audio(file_path: str) -> str:
    print("[STT] Opening audio file...")

    with open(file_path, "rb") as audio_file:
        print("[STT] Sending audio to Groq Whisper...")

        transcription = client.audio.transcriptions.create(
            file=audio_file,
            model="whisper-large-v3-turbo",
            response_format="text",
        )

    print("[STT] Groq Whisper response received")

    return transcription.strip()