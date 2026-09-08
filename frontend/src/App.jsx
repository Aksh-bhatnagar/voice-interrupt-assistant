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

import {
  isSpeaking,
  speak,
  stopSpeaking,
} from "./audio/tts";


function App() {
  const [running, setRunning] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [answer, setAnswer] = useState("");
  const [processing, setProcessing] = useState(false);

  const turnControllerRef = useRef(null);

  const recordingRef = useRef(false);

  if (!turnControllerRef.current) {
    turnControllerRef.current = new TurnController();
  }


  async function handleStart() {
    try {
      await startMicrophone();

      await startVAD({

        onSpeechStart: () => {
          console.log("[APP] Speech detected");

          const controller = turnControllerRef.current;

          if (isSpeaking()) {
            console.log("[BARGE-IN] User speech detected");

            stopSpeaking();

            controller.interrupt();

            try {
              startRecording();

              recordingRef.current = true;
              setRecording(true);

              console.log(
                "[BARGE-IN] Recording started"
              );

            } catch (error) {
              console.error(
                "[BARGE-IN] Recording failed:",
                error
              );
            }

            return;
          }

          console.log("[APP] User started speaking");

          try {
            startRecording();

            recordingRef.current = true;
            setRecording(true);

            console.log("[MIC] Recording started");

          } catch (error) {
            console.error(
              "[MIC] Failed to start recording:",
              error
            );
          }
        },


        onSpeechEnd: async () => {
          console.log("[APP] Speech ended");

          if (!recordingRef.current) {
            console.log(
              "[APP] No recording active"
            );

            return;
          }

          console.log(
            "[APP] User stopped speaking"
          );

          const blob = await stopRecording();

          recordingRef.current = false;
          setRecording(false);

          console.log("[MIC] Recording stopped");
          console.log("[MIC] Audio blob:", blob);

          if (!blob) {
            return;
          }


          try {
            setProcessing(true);
            setAnswer("");

            console.log(
              "[STT] Sending audio to Whisper..."
            );

            const sttResult =
              await transcribeAudio(blob);

            const text =
              sttResult.text?.trim();

            console.log(
              "[STT] Transcript:",
              text
            );

            if (!text || text === ".") {
              console.log(
                "[STT] Empty/invalid transcript"
              );

              return;
            }

            setTranscript(text);

            console.log(
              "[LLM] Sending transcript..."
            );

            const result =
              await turnControllerRef.current.startTurn(
                text
              );

            if (!result) {
              console.log(
                "[TURN] No response"
              );

              return;
            }

            console.log(
              "[LLM] Answer:",
              result.answer
            );

            setAnswer(result.answer);

            console.log(
              "[TTS] Speaking answer..."
            );

            await speak(result.answer);

          } catch (error) {

            console.error(
              "[APP] Processing error:",
              error
            );

          } finally {
            setProcessing(false);
          }
        },
      });

      setRunning(true);

      console.log(
        "[APP] Assistant started"
      );

    } catch (error) {

      console.error(
        "[APP] Failed to start assistant:",
        error
      );
    }
  }


  async function handleStop() {

    recordingRef.current = false;

    stopSpeaking();

    if (turnControllerRef.current) {
      await turnControllerRef.current.interrupt();
      turnControllerRef.current.reset();
    }

    await stopVAD();

    stopMicrophone();

    setRunning(false);
    setRecording(false);
    setProcessing(false);

    console.log(
      "[APP] Assistant stopped"
    );
  }


  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">

      <div className="w-full max-w-3xl">

        {/* HEADER */}

        <div className="text-center mb-8">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm text-slate-300 mb-4">

            <span
              className={`w-2 h-2 rounded-full ${
                running
                  ? "bg-green-400"
                  : "bg-slate-500"
              }`}
            />

            {running
              ? "Assistant online"
              : "Assistant offline"}

          </div>


          <h1 className="text-4xl font-bold">
            Voice Interrupt Assistant
          </h1>


          <p className="text-slate-400 mt-2">
            Ask anything about the college.
          </p>

        </div>


        {/* MAIN CARD */}

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">

          {/* STATUS */}

          <div className="flex items-center justify-between mb-6">

            <div>

              <p className="text-sm text-slate-400">
                Status
              </p>

              <p className="text-lg font-semibold">

                {processing
                  ? "Thinking..."
                  : recording
                  ? "Listening..."
                  : isSpeaking()
                  ? "Speaking..."
                  : running
                  ? "Ready"
                  : "Stopped"}

              </p>

            </div>


            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                recording
                  ? "bg-red-500/20"
                  : isSpeaking()
                  ? "bg-blue-500/20"
                  : "bg-white/10"
              }`}
            >

              <div
                className={`w-6 h-6 rounded-full ${
                  recording
                    ? "bg-red-400 animate-pulse"
                    : isSpeaking()
                    ? "bg-blue-400 animate-pulse"
                    : "bg-slate-400"
                }`}
              />

            </div>

          </div>


          {/* USER */}

          {transcript && (

            <div className="mb-4">

              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                You
              </p>

              <div className="rounded-2xl bg-white/10 p-4">
                {transcript}
              </div>

            </div>

          )}


          {/* ASSISTANT */}

          {answer && (

            <div className="mb-6">

              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                Assistant
              </p>

              <div className="rounded-2xl bg-blue-500/10 border border-blue-400/10 p-5 leading-7 whitespace-pre-line">
                {answer}
              </div>

            </div>

          )}


          {/* EMPTY */}

          {!transcript && !answer && (

            <div className="py-16 text-center text-slate-500">

              <div className="text-5xl mb-4">
                🎙️
              </div>

              <p>
                Start the assistant and ask a question
              </p>

            </div>

          )}


          {/* BUTTON */}

          <div className="flex justify-center pt-4">

            {!running ? (

              <button
                onClick={handleStart}
                className="px-8 py-4 rounded-2xl bg-white text-black font-semibold hover:bg-slate-200 transition"
              >
                Start Assistant
              </button>

            ) : (

              <button
                onClick={handleStop}
                className="px-8 py-4 rounded-2xl bg-red-500 text-white font-semibold hover:bg-red-600 transition"
              >
                Stop Assistant
              </button>

            )}

          </div>

        </div>


        {/* TECHNOLOGY */}

        <div className="flex flex-wrap justify-center gap-3 mt-6 text-xs text-slate-500">

          <span className="px-3 py-1 rounded-full bg-white/5">
            Silero VAD
          </span>

          <span className="px-3 py-1 rounded-full bg-white/5">
            Groq Whisper
          </span>

          <span className="px-3 py-1 rounded-full bg-white/5">
            Groq LLM
          </span>

          <span className="px-3 py-1 rounded-full bg-white/5">
            Barge-in
          </span>

        </div>

      </div>

    </div>
  );
}

export default App;