const API_BASE_URL = "http://127.0.0.1:8000";

export async function sendTurn(turnId, message, signal) {
  const response = await fetch(`${API_BASE_URL}/api/turn`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      turn_id: turnId,
      message,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Turn request failed: ${response.status}`);
  }

  return response.json();
}

export async function cancelTurn(turnId) {
  const response = await fetch(`${API_BASE_URL}/api/turn/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      turn_id: turnId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Cancel request failed: ${response.status}`);
  }

  return response.json();
}

export async function transcribeAudio(audioBlob) {
  const formData = new FormData();

  formData.append("file", audioBlob, "recording.webm");

  const response = await fetch(`${API_BASE_URL}/api/stt`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`STT request failed: ${response.status}`);
  }

  return response.json();
}

export async function generateTTS(text) {
  const response = await fetch(`${API_BASE_URL}/api/tts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
    }),
  });

  if (!response.ok) {
    throw new Error(`TTS request failed: ${response.status}`);
  }

  return response.blob();
}
