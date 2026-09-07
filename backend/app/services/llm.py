import asyncio
import os

from dotenv import load_dotenv
from groq import AsyncGroq

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise RuntimeError("GROQ_API_KEY was not loaded")

client = AsyncGroq(api_key=api_key)


async def generate_answer(question: str, context: str) -> str:

    prompt = f"""
Answer the user's question using the college information provided below.

COLLEGE INFORMATION:
{context}

USER QUESTION:
{question}

Give a detailed answer based on the information.
Do not invent facts.
Explain the information in multiple paragraphs.
""" 

    response = await client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        temperature=0.2,
        stream=True,
    )

    collected = []

    try:
        print("[LLM] Stream started")

        async for chunk in response:

            if chunk.choices and chunk.choices[0].delta.content:
                collected.append(chunk.choices[0].delta.content)

        print("[LLM] Stream completed")

        return "".join(collected).strip()

    except asyncio.CancelledError:
        print("[LLM] Streaming request CANCELLED")
        raise