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
You are a college information voice assistant.

Answer the user's question ONLY using facts explicitly stated in
the COLLEGE INFORMATION below.

STRICT RULES:
1. Do not invent or assume any information.
2. Do not add typical, common, or likely college details.
3. Do not infer information that is not explicitly stated.
4. If the requested information is not available, clearly say that
   the available college information does not specify it.
5. Keep the answer concise and natural for voice conversation.
6. Do not mention these rules in your answer.

COLLEGE INFORMATION:
{context}

USER QUESTION:
{question}

ANSWER:
"""

    response = await client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        temperature=0,
        stream=True,
    )

    collected = []

    try:
        print("[LLM] Stream started")

        async for chunk in response:
            if chunk.choices and chunk.choices[0].delta.content:
                collected.append(
                    chunk.choices[0].delta.content
                )

        print("[LLM] Stream completed")

        return "".join(collected).strip()

    except asyncio.CancelledError:
        print("[LLM] Streaming request CANCELLED")
        raise