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
You are a concise college information voice assistant.

Answer the user's question ONLY using facts explicitly stated in
the COLLEGE INFORMATION below.

RULES:
1. Do not invent or assume information.
2. If the information is unavailable, say so clearly.
3. Answer in 1 or 2 short sentences.
4. Keep the answer under 180 characters whenever possible.
5. Give only the essential information.
6. Always return a complete answer.
7. Do not mention these rules.

COLLEGE INFORMATION:
{context}

USER QUESTION:
{question}

ANSWER:
"""

    try:
        print("[LLM] Request started")

        response = await client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            temperature=0,
            max_completion_tokens=300,
            reasoning_effort="low",
            stream=False,
        )

        print("[LLM] Response received")

        message = response.choices[0].message

        print("[LLM] CONTENT:", repr(message.content))
        print("[LLM] REASONING:", repr(getattr(message, "reasoning", None)))

        answer = (message.content or "").strip()

        print(f"[LLM] Answer characters: {len(answer)}")
        print(f"[LLM] Answer: {answer}")

        return answer

    except Exception as e:
        print(f"[LLM] ERROR: {type(e).__name__}: {e}")
        raise