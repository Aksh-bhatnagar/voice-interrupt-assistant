import { useEffect, useRef, useState } from "react";

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

import Header from "./components/Header";
import VoiceOrb from "./components/VoiceOrb";
import Conversation from "./components/Conversation";
import Pipeline from "./components/Pipeline";
import ControlButton from "./components/ControlButton";
import TechBadges from "./components/TechBadges";
import HelpModal from "./components/HelpModal";

function App() {
  const [running, setRunning] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [answer, setAnswer] = useState("");
  const [processing, setProcessing] = useState(false);
  const [interrupted, setInterrupted] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const hasSeenHelp = localStorage.getItem("voice-assistant-help-seen");

    if (!hasSeenHelp) {
      setHelpOpen(true);
      localStorage.setItem("voice-assistant-help-seen", "true");
    }
  }, []);

  /*
   * Controls when the assistant text starts appearing.
   */
  const [answerDuration, setAnswerDuration] = useState(null);
  const [revealAnswer, setRevealAnswer] = useState(false);

  const turnControllerRef = useRef(null);
  const recordingRef = useRef(false);

  if (!turnControllerRef.current) {
    turnControllerRef.current = new TurnController();
  }

  let status = "ready";

  if (interrupted) {
    status = "interrupted";
  } else if (recording) {
    status = "listening";
  } else if (processing) {
    status = "thinking";
  } else if (isSpeaking()) {
    status = "speaking";
  }

  async function handleStart() {
    try {
      await startMicrophone();

      await startVAD({
        onSpeechStart: () => {
          const controller = turnControllerRef.current;

          /*
           * BARGE-IN
           */
          if (isSpeaking()) {
            setInterrupted(true);
            setProcessing(false);

            /*
             * Stop both voice and visual answer reveal.
             */
            setRevealAnswer(false);
            setAnswerDuration(null);

            stopSpeaking();

            controller.interrupt();

            try {
              startRecording();

              recordingRef.current = true;
              setRecording(true);
            } catch (error) {
              console.error(error);
            }

            return;
          }

          setInterrupted(false);

          try {
            startRecording();

            recordingRef.current = true;
            setRecording(true);
          } catch (error) {
            console.error(error);
          }
        },

        onSpeechEnd: async () => {
          if (!recordingRef.current) {
            return;
          }

          const blob = await stopRecording();

          recordingRef.current = false;
          setRecording(false);

          if (!blob) {
            return;
          }

          try {
            setProcessing(true);
            setInterrupted(false);

            /*
             * Clear the previous answer immediately.
             */
            setAnswer("");
            setRevealAnswer(false);
            setAnswerDuration(null);

            const sttResult = await transcribeAudio(blob);

            const text = sttResult.text?.trim();

            if (!text || text === ".") {
              return;
            }

            setTranscript(text);

            const result = await turnControllerRef.current.startTurn(text);

            if (!result) {
              return;
            }

            /*
             * We now have the complete LLM answer.
             * Keep it hidden until TTS is actually ready.
             */
            setAnswer(result.answer);

            /*
             * Generate and start TTS.
             *
             * speak() calls this callback when the decoded
             * audio is ready and playback is about to start.
             */
            await speak(result.answer, (duration) => {
              console.log(
                "[UI] Starting answer reveal",
                `duration=${duration.toFixed(2)}s`,
              );

              setAnswerDuration(duration);
              setRevealAnswer(true);
            });
          } catch (error) {
            console.error(error);
          } finally {
            setProcessing(false);
          }
        },
      });

      setRunning(true);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleStop() {
    recordingRef.current = false;

    /*
     * Stop visual answer reveal.
     */
    setRevealAnswer(false);
    setAnswerDuration(null);

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
    setInterrupted(false);
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#03050D] text-slate-100 font-sans selection:bg-cyan-500/30 flex flex-col justify-center">
      <div className="pointer-events-none absolute inset-0 overflow-hidden mix-blend-screen">
        <div className="absolute left-1/2 top-[-10%] h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[160px] opacity-70" />

        <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-violet-600/15 blur-[140px] opacity-60" />

        <div className="absolute bottom-[-5%] right-[-10%] h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[140px] opacity-60" />
      </div>

      <div className="relative mx-auto flex w-full max-w-5xl flex-col px-5 py-6 sm:px-8">
        <Header running={running} />

        <div className="mx-auto mt-6 w-full max-w-3xl">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-3xl transition-all">
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              className="absolute right-5 top-5 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-slate-400 backdrop-blur-md transition hover:border-white/20 hover:bg-white/10 hover:text-white"
              aria-label="How to use"
              title="How to use"
            >
              ?
            </button>
            <VoiceOrb status={status} />

            <div className="px-6 pb-6 sm:px-8">
              <Conversation
                transcript={transcript}
                answer={answer}
                answerDuration={answerDuration}
                revealAnswer={revealAnswer}
              />

              <Pipeline status={status} />

              <div className="flex justify-center pt-6 pb-2">
                <ControlButton
                  running={running}
                  onStart={handleStart}
                  onStop={handleStop}
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <TechBadges />
          </div>

          <div className="mt-5 flex items-center justify-center gap-3 text-center text-xs tracking-widest text-slate-500 uppercase font-medium">
            <span>Voice-first AI</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span>Real-time interruption</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span>Grounded answers</span>
          </div>
        </div>
      </div>
      <HelpModal
  open={helpOpen}
  onClose={() => setHelpOpen(false)}
/>
    </div>
  );
}

export default App;
