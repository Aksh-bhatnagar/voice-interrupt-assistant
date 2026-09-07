let currentUtterance = null;
let speaking = false;

export function speak(text, options = {}) {
  if (!text) {
    return;
  }

  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.rate = options.rate ?? 1;
  utterance.pitch = options.pitch ?? 1;
  utterance.volume = options.volume ?? 1;

  currentUtterance = utterance;
  speaking = true;

  console.log("[TTS] Started");

  utterance.onend = () => {
    if (currentUtterance === utterance) {
      currentUtterance = null;
      speaking = false;
      console.log("[TTS] Finished");
    }
  };

  utterance.onerror = () => {
    if (currentUtterance === utterance) {
      currentUtterance = null;
      speaking = false;
      console.log("[TTS] Ended with error");
    }
  };

  speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  speechSynthesis.cancel();

  currentUtterance = null;
  speaking = false;

  console.log("[TTS] Stopped");
}

export function isSpeaking() {
  return speaking;
}