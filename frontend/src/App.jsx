import { useRef, useState } from "react";
import TurnController from "./turn/TurnController";

import { startVAD, stopVAD } from "./audio/vad";
import {
  startMicrophone,
  startRecording,
  stopRecording,
  stopMicrophone,
} from "./audio/micCapture";

import { transcribeAudio } from "./api/backend";
import { isSpeaking, speak, stopSpeaking } from "./audio/tts";
import { TURN_STATES } from "./turn/turnState";

function App() {
  const [running, setRunning] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [answer, setAnswer] = useState("");
  const [processing, setProcessing] = useState(false);
  const turnControllerRef = useRef(null);

  if (!turnControllerRef.current) {
    turnControllerRef.current = new TurnController();
  }

  async function handleStart() {
    await startMicrophone();

    await startVAD({
      onSpeechStart: () => {
        console.log("[APP] Speech detected");

        const controller = turnControllerRef.current;

        // Assistant is speaking → possible barge-in
        if (isSpeaking() && controller.state === TURN_STATES.SPEAKING) {
          console.log("[BARGE-IN] User interrupted assistant");

          stopSpeaking();

          controller.interrupt();

          startRecording();
          setRecording(true);

          console.log("[MIC] Recording started after interruption");

          return;
        }

        // Normal user speech
        if (
          controller.state === TURN_STATES.IDLE ||
          controller.state === TURN_STATES.LISTENING
        ) {
          console.log("[APP] User started speaking");

          startRecording();
          setRecording(true);

          console.log("[MIC] Recording started");
        }
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

          console.log("[LLM] Sending transcript...");

          const result = await turnControllerRef.current.startTurn(text);

          if (!result) {
            console.log("[TURN] No active response");
            return;
          }

          console.log("[LLM] Answer:", result.answer);

          setAnswer(result.answer);

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
      <h1 className="text-3xl font-bold">Voice Interrupt Assistant</h1>

      <p>VAD: {running ? "Running" : "Stopped"}</p>

      <p>Microphone: {recording ? "Recording" : "Waiting"}</p>

      {processing && <p className="font-semibold">Processing...</p>}

      {transcript && (
        <div className="w-full max-w-xl rounded-lg border p-4">
          <p className="font-semibold mb-2">You said</p>

          <p>{transcript}</p>
        </div>
      )}

      {answer && (
        <div className="w-full max-w-xl rounded-lg border p-4">
          <p className="font-semibold mb-2">Assistant</p>

          <p>{answer}</p>
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
