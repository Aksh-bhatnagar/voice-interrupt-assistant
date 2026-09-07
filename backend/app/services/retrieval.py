from pathlib import Path

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


KNOWLEDGE_DIR = Path(__file__).resolve().parent.parent / "knowledge"

model = SentenceTransformer("all-MiniLM-L6-v2")


def load_documents():
    documents = []

    for file_path in KNOWLEDGE_DIR.glob("*.md"):
        text = file_path.read_text(encoding="utf-8").strip()

        if text:
            documents.append({
                "source": file_path.name,
                "text": text
            })

    return documents


documents = load_documents()

document_embeddings = model.encode(
    [doc["text"] for doc in documents]
)


def retrieve(query: str, top_k: int = 3):
    query_embedding = model.encode([query])

    scores = cosine_similarity(
        query_embedding,
        document_embeddings
    )[0]

    ranked = sorted(
        zip(documents, scores),
        key=lambda item: item[1],
        reverse=True
    )

    results = []

    for document, score in ranked[:top_k]:
        results.append({
            "source": document["source"],
            "text": document["text"],
            "score": float(score)
        })

    return results