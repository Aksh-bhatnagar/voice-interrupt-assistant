import asyncio

from app.services.stt import transcribe_audio


async def main():
    audio_path = "test_audio.mpeg"

    print("Starting transcription...")

    text = await transcribe_audio(audio_path)

    print("\n--- TRANSCRIPTION ---")
    print(text)
    print("---------------------")


if __name__ == "__main__":
    asyncio.run(main())