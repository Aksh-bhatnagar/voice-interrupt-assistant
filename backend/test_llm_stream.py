import asyncio
import os

from dotenv import load_dotenv
from groq import AsyncGroq

load_dotenv()

client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))


async def main():
    context = """
The college provides hostel accommodation for eligible students.

Hostel rooms are allocated based on availability and the college hostel admission process.

Students staying in the hostel must follow hostel rules and regulations.

Hostel fees are separate from academic tuition fees.
"""

    response = await client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "user",
                "content": f"""
Answer this question using the information below.

Information:
{context}

Question:
What are the hostel facilities?

Give a direct answer. Do not say that the information is unavailable.
"""
            }
        ],
        temperature=0.2,
        stream=True,
    )

    collected = []

    async for chunk in response:
        if chunk.choices and chunk.choices[0].delta.content:
            text = chunk.choices[0].delta.content
            print(text, end="", flush=True)
            collected.append(text)

    print("\n\n--- COMPLETE ---")
    print("".join(collected))


if __name__ == "__main__":
    asyncio.run(main())