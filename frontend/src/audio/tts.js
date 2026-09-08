import { generateTTS } from "../api/backend";

let audioContext = null;
let currentSource = null;
let currentBuffer = null;
let ttsAnalyser = null;
let speaking = false;
let playbackStartTime = 0;

function getOrCreateAudioContext() {
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  return audioContext;
}

async function ensureAudioContext() {
  const ctx = getOrCreateAudioContext();

  if (ctx.state === "suspended") {
    await ctx.resume();
  }

  return ctx;
}

export async function speak(text, onStart) {
  if (!text) return;

  stopSpeaking();

  const ctx = await ensureAudioContext();

  console.log("[TTS] Generating controllable audio...");

  try {
    const audioBlob = await generateTTS(text);

    const arrayBuffer = await audioBlob.arrayBuffer();

    const audioBuffer =
      await ctx.decodeAudioData(arrayBuffer);

    currentBuffer = audioBuffer;

    const source = ctx.createBufferSource();

    source.buffer = audioBuffer;

    ttsAnalyser = ctx.createAnalyser();
    ttsAnalyser.fftSize = 2048;
    ttsAnalyser.smoothingTimeConstant = 0;

    source.connect(ttsAnalyser);
    ttsAnalyser.connect(ctx.destination);

    currentSource = source;
    speaking = true;

    playbackStartTime = ctx.currentTime;

    console.log(
      "[TTS] Started",
      `duration=${audioBuffer.duration.toFixed(2)}s`
    );

    // Tell the UI that TTS is ready to start.
    // Pass the exact generated audio duration.
    onStart?.(audioBuffer.duration);

    source.onended = () => {
      if (currentSource === source) {
        currentSource = null;
        currentBuffer = null;
        ttsAnalyser = null;
        speaking = false;
        playbackStartTime = 0;

        console.log("[TTS] Finished");
      }
    };

    source.start(0);

  } catch (error) {
    speaking = false;

    console.error("[TTS] FAILED:", error);

    throw error;
  }
}

export function stopSpeaking() {
  if (currentSource) {
    try {
      currentSource.stop();
    } catch {}

    try {
      currentSource.disconnect();
    } catch {}

    currentSource = null;
  }

  currentBuffer = null;
  ttsAnalyser = null;
  speaking = false;
  playbackStartTime = 0;

  console.log("[TTS] Stopped");
}

export function isSpeaking() {
  return speaking;
}

export function getTTSAnalyser() {
  return ttsAnalyser;
}

export function getTTSBuffer() {
  return currentBuffer;
}

export function getPlaybackStartTime() {
  return playbackStartTime;
}

export function getSharedAudioContext() {
  return audioContext;
}