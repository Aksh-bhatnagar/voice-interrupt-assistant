# A Voice You Can Interrupt

A real-time browser voice assistant designed for **natural conversation and true barge-in interaction**.

The assistant listens through the browser microphone, detects speech using Silero VAD, transcribes it with Groq Whisper, retrieves relevant information from a local college knowledge base, generates a grounded answer using a Groq LLM, and speaks the response using controllable text-to-speech.

The key feature is **real-time interruption**: while the assistant is speaking, the user can start talking naturally and the assistant immediately stops its current response and processes the new request.

---

## Demo

**Demo Video:** `TODO — add video link`

**GitHub:** `TODO — add repository link`

---

## Why This Project?

Most voice assistants follow a turn-based interaction:

```text
Assistant speaks
      ↓
Assistant finishes
      ↓
User speaks
      ↓
Assistant responds
```

That feels unnatural when the user wants to interrupt, correct, or change their question.

This project implements a **barge-in voice interaction model**:

```text
Assistant speaking
       ↓
User starts speaking
       ↓
Speech detected
       ↓
Current audio stops
       ↓
Current turn is cancelled
       ↓
User's new speech is captured
       ↓
STT → Retrieval → LLM → TTS
```

The user does not have to wait for the assistant to finish speaking.

---

# Features

### 🎙️ Real-Time Voice Interaction

* Browser-based microphone input
* Automatic speech detection
* No push-to-talk required during conversation
* Natural conversational flow

### ⚡ Barge-In / Voice Interruption

The assistant can be interrupted while speaking.

When the user starts talking:

* Current TTS playback stops
* The active frontend request is aborted
* The backend cancels the active turn
* The new user utterance is captured
* A new turn is created

This prevents the assistant from continuing an obsolete response after the user has changed the conversation.

### 🧠 Grounded AI Answers

The assistant answers questions using a small local college knowledge base.

The system retrieves relevant Markdown documents before sending context to the LLM.

This reduces hallucination and keeps responses grounded in the available information.

### 🔎 Semantic Retrieval

Knowledge documents are embedded using:

* `sentence-transformers`
* `all-MiniLM-L6-v2`

Relevant documents are selected using cosine similarity.

### 🗣️ Speech-to-Text

User speech is transcribed using:

* Groq
* Whisper

### 🔊 Controllable Text-to-Speech

Assistant responses are converted to audio and played through the browser using the Web Audio API.

Because playback is controllable, the assistant can stop speaking immediately during an interruption.

### 🛡️ Turn Cancellation

Every conversation turn receives a unique `turn_id`.

This allows the system to:

* Track the active turn
* Cancel obsolete turns
* Ignore stale responses
* Prevent old responses from replacing newer responses

### 🎨 Voice-First UI

The interface provides visual feedback for:

* Ready
* Listening
* Thinking
* Speaking
* Interrupted

A central animated voice orb represents the assistant's current state.

---

# System Architecture

```text
                         USER
                          │
                          ▼
                  ┌───────────────┐
                  │ Browser Mic   │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │  Silero VAD   │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │   Recording   │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │ Groq Whisper  │
                  │     STT       │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │   Retrieval   │
                  │ Sentence      │
                  │ Transformers  │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │   Groq LLM    │
                  │   Response    │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │    Groq TTS   │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │ Web Audio API │
                  │   Playback    │
                  └───────────────┘
```

---

# Barge-In Architecture

The most important part of the system is the interruption path.

```text
                    ASSISTANT SPEAKING
                           │
                           ▼
                    User starts talking
                           │
                           ▼
                      Silero VAD
                           │
                           ▼
                    Speech detected
                           │
                           ▼
                    ┌──────────────┐
                    │ Stop TTS     │
                    │ immediately  │
                    └──────┬───────┘
                           │
                           ▼
                    Abort frontend
                    request
                           │
                           ▼
                    Cancel backend
                    active turn
                           │
                           ▼
                    Old turn DEAD
                           │
                           ▼
                    Capture new audio
                           │
                           ▼
                       Groq STT
                           │
                           ▼
                      Retrieval
                           │
                           ▼
                        Groq LLM
                           │
                           ▼
                         TTS
```

Each turn is identified using a unique ID:

```text
turn-1
  ↓
assistant response

User interrupts

turn-1 → cancelled

turn-2
  ↓
new user request
```

This prevents stale responses from being accepted after an interruption.

---

# AI / Voice Pipeline

The complete pipeline is:

```text
MIC → VAD → STT → RAG → LLM → TTS
```

### MIC

Captures audio using the browser MediaDevices API.

### VAD

Silero VAD detects when the user starts and stops speaking.

### STT

Groq Whisper converts speech into text.

### RAG

Relevant information is retrieved from local Markdown documents using semantic similarity.

### LLM

The Groq LLM generates a concise answer using only the retrieved college information.

### TTS

The answer is converted into speech and played through the browser.

---

# Knowledge Base

The assistant currently uses a small local knowledge base:

```text
backend/app/knowledge/
├── admission.md
├── hostel.md
├── fees.md
└── scholarship.md
```

The documents contain information about:

* College admission
* Hostel facilities
* Fees
* Scholarships

No database is required for the knowledge base.

Documents are loaded and embedded when the backend starts.

---

# Hallucination Control

The LLM is instructed to use only information explicitly present in the retrieved college documents.

The prompt enforces rules such as:

* Do not invent information
* Do not assume missing information
* Do not infer unspecified details
* Clearly state when information is unavailable
* Keep answers concise for voice interaction

This allows the assistant to provide grounded answers instead of generating generic college information.

---

# Tech Stack

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

## AI / ML

* Groq Whisper
* Groq LLM
* Groq TTS
* Sentence Transformers
* Scikit-learn
* `all-MiniLM-L6-v2`

## Knowledge Storage

* Local Markdown files

---

# Project Structure

```text
voice-interrupt-assistant/
│
├── backend/
│   └── app/
│       ├── knowledge/
│       │   ├── admission.md
│       │   ├── hostel.md
│       │   ├── fees.md
│       │   └── scholarship.md
│       │
│       ├── models/
│       │   └── schemas.py
│       │
│       ├── routes/
│       │   ├── turn.py
│       │   ├── stt.py
│       │   └── tts.py
│       │
│       ├── services/
│       │   ├── llm.py
│       │   ├── retrieval.py
│       │   ├── stt.py
│       │   └── turn_manager.py
│       │
│       ├── config.py
│       └── main.py
│
├── frontend/
│   ├── public/
│   │   └── vad/
│   │
│   └── src/
│       ├── api/
│       │   └── backend.js
│       │
│       ├── audio/
│       │   ├── micCapture.js
│       │   ├── tts.js
│       │   └── vad.js
│       │
│       ├── components/
│       │   ├── Header.jsx
│       │   ├── VoiceOrb.jsx
│       │   ├── Conversation.jsx
│       │   ├── Pipeline.jsx
│       │   ├── ControlButton.jsx
│       │   └── TechBadges.jsx
│       │
│       ├── turn/
│       │   ├── TurnController.js
│       │   └── turnState.js
│       │
│       ├── App.jsx
│       └── main.jsx
│
└── README.md
```

---

# Running Locally

## 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd voice-interrupt-assistant
```

---

## 2. Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

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

Start the backend:

```bash
python -m uvicorn app.main:app --reload --port 8000
```

The backend will run at:

```text
http://127.0.0.1:8000
```

---

# Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start Vite:

```bash
npm run dev
```

Open the URL shown by Vite, usually:

```text
http://localhost:5173
```

Allow microphone access when prompted.

---

# Environment Variables

Backend:

```env
GROQ_API_KEY=your_groq_api_key
```

For production, the frontend should use an environment variable for the backend URL:

```env
VITE_API_BASE_URL=https://your-backend-url
```

The Groq API key must **never** be placed in the frontend.

---

# API Endpoints

## Health Check

```http
GET /
```

Returns the backend status.

---

## Speech-to-Text

```http
POST /api/stt
```

Accepts an audio file and returns the transcription.

Example response:

```json
{
  "text": "What facilities are available in the hostel?"
}
```

---

## Create Turn

```http
POST /api/turn
```

Request:

```json
{
  "turn_id": "unique-turn-id",
  "message": "What facilities are available in the hostel?"
}
```

Response:

```json
{
  "turn_id": "unique-turn-id",
  "answer": "The hostel provides..."
}
```

---

## Cancel Turn

```http
POST /api/turn/cancel
```

Request:

```json
{
  "turn_id": "unique-turn-id"
}
```

This cancels the active backend turn.

---

## Text-to-Speech

```http
POST /api/tts
```

Request:

```json
{
  "text": "The hostel provides separate accommodation..."
}
```

Returns generated audio for browser playback.

---

# Demo Scenarios

The project is designed around three important interaction cases.

### 1. Assistant Only

The assistant speaks while the user remains silent.

Expected behavior:

```text
Assistant → continues speaking
```

The assistant must not interrupt itself.

---

### 2. Assistant + User

The assistant is speaking and the user starts talking.

Expected behavior:

```text
Assistant speaking
       ↓
User speaks
       ↓
Assistant stops
       ↓
New question processed
       ↓
New answer spoken
```

This demonstrates the core **barge-in capability**.

---

### 3. User Only

The assistant is silent and the user starts speaking.

Expected behavior:

```text
User speaks
    ↓
VAD detects speech
    ↓
Audio recorded
    ↓
Whisper transcription
    ↓
RAG + LLM
    ↓
TTS response
```

---

# Example Questions

Try questions such as:

```text
What facilities are available in the hostel?

How much are the hostel fees?

What scholarship opportunities are available?

What are the admission requirements?

What documents are required for admission?
```

The assistant should answer only using information available in the knowledge base.

---

# Design Philosophy

The interface intentionally focuses on the voice interaction rather than displaying a large amount of technical information.

The main visual element is a central voice orb representing the current state:

```text
READY
  ↓
LISTENING
  ↓
THINKING
  ↓
SPEAKING
  ↓
INTERRUPTED
```

A lightweight pipeline indicator shows the underlying AI pipeline:

```text
MIC → VAD → STT → RAG → LLM → TTS
```

The latest user transcript and assistant response are displayed to make the interaction understandable during a demo.

---

# Limitations

* The current knowledge base is intentionally small and focused on college information.
* TTS is currently optimized for English speech.
* Speech recognition quality depends on microphone quality and environmental noise.
* Semantic retrieval works best for questions related to the available documents.
* Internet connectivity is required for Groq API requests.
* Browser microphone permissions are required.

---

# Future Improvements

Possible future improvements include:

* Streaming LLM responses directly into streaming TTS
* More advanced endpointing for trailing-off speech
* Larger document collections
* Improved retrieval using chunk-level indexing
* Conversation history
* Multilingual speech support
* Authentication and persistent user sessions
* More advanced audio echo cancellation
* Production monitoring and analytics

---

# Key Takeaway

This project is not designed simply to make an AI speak.

It focuses on making voice interaction feel **interruptible and conversational**.

The central interaction is:

```text
USER                         ASSISTANT

  │                              │
  │◄────── assistant speaks ─────│
  │                              │
  │──── user interrupts ────────►│
  │                              │
  │                         STOP SPEAKING
  │                         CANCEL TURN
  │                              │
  │◄────── new answer ───────────│
  │                              │
```

**You don't have to wait for the AI to finish.**

---

# License

This project is created as a prototype / challenge project.

Add the appropriate license here before publishing if required.
