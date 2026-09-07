from app.services.retrieval import retrieve


results = retrieve(
    "What are the hostel facilities?",
    top_k=2
)

for result in results:
    print("\n" + "=" * 60)
    print("SOURCE:", result["source"])
    print("SCORE:", result["score"])
    print(result["text"])