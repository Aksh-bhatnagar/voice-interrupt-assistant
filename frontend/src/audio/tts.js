let currentUtterance = null;

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

  utterance.onend = () => {
    if (currentUtterance === utterance) {
      currentUtterance = null;
    }
  };

  utterance.onerror = () => {
    if (currentUtterance === utterance) {
      currentUtterance = null;
    }
  };

  speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  speechSynthesis.cancel();
  currentUtterance = null;
}

export function isSpeaking() {
  return speechSynthesis.speaking;
}