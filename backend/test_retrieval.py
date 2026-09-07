from app.services.retrieval import retrieve


queries = [
    "How can I apply for college admission?",
    "What are the hostel facilities?",
    "How much is the tuition fee?",
    "Are scholarships available?",
]


for query in queries:
    print("\n" + "=" * 60)
    print("QUERY:", query)

    results = retrieve(query, top_k=2)

    for result in results:
        print(
            f"\nSOURCE: {result['source']}"
            f"\nSCORE: {result['score']:.4f}"
        )