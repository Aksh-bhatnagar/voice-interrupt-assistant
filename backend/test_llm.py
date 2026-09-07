import asyncio
from multiprocessing import context

from app.services.retrieval import retrieve
from app.services.llm import generate_answer


async def main():
    question ="What are the hostel facilities?"

    results = retrieve(question, top_k=2)

    context = "\n\n".join(
        f"Source: {result['source']}\n{result['text']}"
        for result in results
    )

    print("QUESTION:")
    print(question)

    print("CONTEXT BEING SENT TO LLM:")
    print(context)
    print("\n" + "=" * 60)

    print("\nGENERATING ANSWER...\n")

    answer = await generate_answer(question, context)

    print("ANSWER:")
    print(answer)


if __name__ == "__main__":
    asyncio.run(main())