# A Voice You Can Interrupt

A browser-based real-time voice assistant that lets users **interrupt the AI while it is speaking**.

The assistant uses browser microphone input, Silero VAD, Groq Whisper, semantic retrieval, a Groq LLM, and controllable text-to-speech to create a natural voice conversation.

The core feature is **barge-in**: when the user starts speaking while the assistant is talking, the current response is stopped, the active turn is cancelled, and the new request is processed.

---

## Quick Overview

```text
User speaks
    |
    v
Silero VAD
    |
    v
Groq Whisper
    |
    v
Semantic Retrieval
    |
    v
Groq LLM
    |
    v
Text-to-Speech
    |
    v
Assistant speaks
```

### The important part: interruption

```text
Assistant is speaking
        |
        v
User starts speaking
        |
        v
Speech detected
        |
        v
Stop audio + cancel active turn
        |
        v
Capture new request
        |
        v
STT -> RAG -> LLM -> TTS
```

The user does not have to wait for the assistant to finish.

---

# How to Run

## Requirements

* Python 3.10+
* Node.js
* A Groq API key
* A browser with microphone support

## 1. Clone the repository

```bash
git clone https://github.com/Aksh-bhatnagar/voice-interrupt-assistant
cd voice-interrupt-assistant
```

## 2. Start the backend

```bash
cd backend
python -m venv venv
```

Windows:

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install fastapi uvicorn python-dotenv python-multipart groq sentence-transformers scikit-learn
```

Create:

```text
backend/.env
```

Add:

```env
GROQ_API_KEY=your_groq_api_key
```

Start the server:

```bash
python -m uvicorn app.main:app --reload --port 8000
```

Backend:

```text
http://127.0.0.1:8000
```

## 3. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL, usually:

```text
http://localhost:5173
```

Allow microphone access when prompted.

---

# Example Questions

The assistant currently answers questions about the college knowledge base.

Try:

```text
What facilities are available in the hostel?

What are the hostel fees?

What scholarship opportunities are available?

What are the admission requirements?

What documents are required for admission?

Does the hostel provide Wi-Fi?

Does the hostel have laundry facilities?
```

The assistant is instructed to answer using only information available in the knowledge base.

---

For the best demonstration, show these three cases.

### Normal conversation

Ask a question and allow the assistant to complete its response.

### Barge-in

While the assistant is speaking, start asking another question.

Expected behavior:

```text
Assistant speaking
        |
User interrupts
        |
Assistant stops immediately
        |
Previous turn cancelled
        |
New question processed
        |
New answer spoken
```

### User-only speech

Start speaking while the assistant is silent.

The system should capture and process the request normally.

---

# What Makes This Different?

Traditional voice assistants often behave like this:

```text
Assistant speaks
        |
Wait
        |
Assistant finishes
        |
User speaks
```

This project is designed around:

```text
Assistant speaks
        |
User can interrupt at any time
        |
Assistant stops
        |
New request takes control
```

This makes the interaction feel closer to a real conversation.

---

# Technology Stack

## Frontend

* React
* Vite
* JavaScript
* Tailwind CSS
* Web Audio API
* MediaRecorder API
* Silero VAD
* ONNX Runtime Web

## Backend

* Python
* FastAPI
* Pydantic
* asyncio

## AI

* Groq Whisper for speech-to-text
* Groq LLM for response generation
* Groq TTS for speech generation
* Sentence Transformers for semantic retrieval
* Scikit-learn for cosine similarity

## Knowledge Base

Local Markdown documents containing college information.

No database is required.

---

# Architecture

```text
                         USER
                          |
                          v
                   Browser Microphone
                          |
                          v
                    Silero VAD
                          |
                          v
                     Recording
                          |
                          v
                    Groq Whisper
                         STT
                          |
                          v
                Semantic Retrieval
                          |
                          v
                     Groq LLM
                          |
                          v
                      Groq TTS
                          |
                          v
                    Web Audio API
                          |
                          v
                     SPEAKING
```

The frontend communicates with the FastAPI backend through HTTP endpoints.

---

# Barge-In and Turn Cancellation

Every conversation turn receives a unique `turn_id`.

For example:

```text
turn-1
```

If the assistant is speaking and the user interrupts:

```text
turn-1
   |
   v
cancelled
```

A new turn is then created:

```text
turn-2
   |
   v
new user request
```

The frontend uses `AbortController` to stop the active request.

The backend uses `asyncio` task cancellation to cancel the active processing task.

This prevents stale responses from previous turns from taking control of the conversation.

---

# Retrieval and Grounded Answers

The knowledge base contains information about:

* College admission
* Hostel facilities
* Fees
* Scholarships

Documents are embedded using:

```text
all-MiniLM-L6-v2
```

When the user asks a question:

```text
User question
     |
     v
Question embedding
     |
     v
Cosine similarity
     |
     v
Relevant documents
     |
     v
LLM context
```

The LLM is instructed to use only information explicitly available in the retrieved documents.

If the information is unavailable, the assistant should say so instead of inventing an answer.

---

# Voice Pipeline

The complete pipeline is:

```text
MIC -> VAD -> STT -> RAG -> LLM -> TTS
```

### MIC

Captures microphone audio in the browser.

### VAD

Silero VAD detects when the user starts and stops speaking.

### STT

Groq Whisper converts recorded speech into text.

### RAG

Relevant college information is retrieved from the local Markdown knowledge base.

### LLM

The Groq LLM generates a concise, grounded response.

### TTS

The response is converted to speech and played through the browser.

Because playback is controllable, it can be stopped when the user interrupts.

---

# UI

The interface is designed around the voice interaction.

The central orb represents the current state:

```text
READY
  |
LISTENING
  |
THINKING
  |
SPEAKING
  |
INTERRUPTED
```

The interface also shows the processing pipeline:

```text
MIC -> VAD -> STT -> RAG -> LLM -> TTS
```

The latest user transcript and assistant response are displayed so the interaction can be followed during a demonstration.

---

# API Endpoints

### Health Check

```http
GET /
```

### Speech-to-Text

```http
POST /api/stt
```

Accepts recorded audio and returns the transcription.

### Create Turn

```http
POST /api/turn
```

Processes a user request through retrieval and the LLM.

Example:

```json
{
  "turn_id": "unique-turn-id",
  "message": "What facilities are available in the hostel?"
}
```

### Cancel Turn

```http
POST /api/turn/cancel
```

Cancels the currently active turn.

Example:

```json
{
  "turn_id": "unique-turn-id"
}
```

### Text-to-Speech

```http
POST /api/tts
```

Converts the generated answer into audio.

---

# Environment Variables

Backend:

```env
GROQ_API_KEY=your_groq_api_key
```

For production, the frontend uses:

```env
VITE_API_BASE_URL=https://your-backend-url
```

---

# License

This project was created as a prototype for a voice AI challenge.
