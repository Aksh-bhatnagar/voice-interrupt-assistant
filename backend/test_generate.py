import asyncio

from app.services.retrieval import retrieve
from app.services.llm import generate_answer


async def main():
    question = "What are the hostel facilities?"

    results = retrieve(question, top_k=2)

    context = "\n\n".join(
        f"Source: {result['source']}\n{result['text']}"
        for result in results
    )

    print("CALLING generate_answer()...\n")

    answer = await generate_answer(
        question=question,
        context=context,
    )

    print("ANSWER:")
    print(answer)


if __name__ == "__main__":
    asyncio.run(main())