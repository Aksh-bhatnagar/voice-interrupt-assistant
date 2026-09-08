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
    <div className="relative min-h-screen overflow-x-hidden bg-[#12181f] text-[#f3eee1] font-sans selection:bg-[#c79a4f]/30 flex flex-col justify-center">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-8%] h-[560px] w-[720px] -translate-x-1/2 rounded-full bg-[#c79a4f]/[0.06] blur-[170px]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-5xl flex-col px-5 py-6 sm:px-8">
        <Header running={running} />

        <div className="mx-auto mt-8 w-full max-w-3xl">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-[#f3eee1]/[0.08] bg-[#161d26] shadow-[0_8px_32px_rgba(0,0,0,0.45)] transition-all">
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              className="absolute right-5 top-5 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-[#f3eee1]/[0.12] font-serif italic text-sm text-[#8d95a3] transition hover:border-[#c79a4f]/50 hover:text-[#c79a4f]"
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

              <div className="flex justify-center pt-8 pb-2">
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
        </div>
      </div>

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}

export default App;