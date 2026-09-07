import { useState } from "react";

import { startVAD, stopVAD } from "./audio/vad";
import {
  startMicrophone,
  startRecording,
  stopRecording,
  stopMicrophone,
} from "./audio/micCapture";

import { transcribeAudio, sendTurn } from "./api/backend";
import { speak, stopSpeaking } from "./audio/tts";

function App() {
  const [running, setRunning] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [answer, setAnswer] = useState("");
  const [processing, setProcessing] = useState(false);

  async function handleStart() {
    await startMicrophone();

    await startVAD({
      onSpeechStart: () => {
        console.log("[APP] User started speaking");

        // Stop any current assistant speech
        stopSpeaking();

        startRecording();
        setRecording(true);

        console.log("[MIC] Recording started");
      },

      onSpeechEnd: async () => {
        console.log("[APP] User stopped speaking");

        const blob = await stopRecording();

        setRecording(false);

        console.log("[MIC] Recording stopped");
        console.log("[MIC] Audio blob:", blob);

        if (!blob) {
          console.log("[STT] No audio blob");
          return;
        }

        try {
          setProcessing(true);
          setAnswer("");

          console.log("[STT] Sending audio to Whisper...");

          const sttResult = await transcribeAudio(blob);

          const text = sttResult.text?.trim();

          console.log("[STT] Transcript:", text);

          if (!text) {
            console.log("[STT] Empty transcript");
            setProcessing(false);
            return;
          }

          setTranscript(text);

          const turnId = crypto.randomUUID();

          console.log("[LLM] Sending transcript...");
          console.log("[TURN] ID:", turnId);

          const result = await sendTurn(
            turnId,
            text
          );

          console.log("[LLM] Answer:", result.answer);

          setAnswer(result.answer);

          // Speak assistant response
          console.log("[TTS] Speaking answer...");
          speak(result.answer);

        } catch (error) {
          console.error("[APP] Processing error:", error);
        } finally {
          setProcessing(false);
        }
      },
    });

    setRunning(true);
  }

  async function handleStop() {
    stopSpeaking();

    await stopVAD();

    stopMicrophone();

    setRunning(false);
    setRecording(false);

    console.log("[APP] Microphone stopped");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 p-6">

      <h1 className="text-3xl font-bold">
        Voice Interrupt Assistant
      </h1>

      <p>
        VAD: {running ? "Running" : "Stopped"}
      </p>

      <p>
        Microphone: {recording ? "Recording" : "Waiting"}
      </p>

      {processing && (
        <p className="font-semibold">
          Processing...
        </p>
      )}

      {transcript && (
        <div className="w-full max-w-xl rounded-lg border p-4">
          <p className="font-semibold mb-2">
            You said
          </p>

          <p>
            {transcript}
          </p>
        </div>
      )}

      {answer && (
        <div className="w-full max-w-xl rounded-lg border p-4">
          <p className="font-semibold mb-2">
            Assistant
          </p>

          <p>
            {answer}
          </p>
        </div>
      )}

      {!running ? (
        <button
          onClick={handleStart}
          className="px-6 py-3 rounded-lg bg-black text-white"
        >
          Start Assistant
        </button>
      ) : (
        <button
          onClick={handleStop}
          className="px-6 py-3 rounded-lg bg-gray-700 text-white"
        >
          Stop Assistant
        </button>
      )}

    </div>
  );
}

export default App;