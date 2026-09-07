let mediaStream = null;
let mediaRecorder = null;
let audioChunks = [];

export async function startMicrophone() {
  if (mediaStream) {
    return mediaStream;
  }

 mediaStream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
});

  return mediaStream;
}

export function startRecording() {
  if (!mediaStream) {
    throw new Error("Microphone is not started");
  }

  audioChunks = [];

  mediaRecorder = new MediaRecorder(mediaStream);

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      audioChunks.push(event.data);
    }
  };

  mediaRecorder.start();
}

export function stopRecording() {
  return new Promise((resolve) => {
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
      resolve(null);
      return;
    }

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, {
        type: mediaRecorder.mimeType,
      });

      audioChunks = [];
      resolve(audioBlob);
    };

    mediaRecorder.stop();
  });
}

export function stopMicrophone() {
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => {
      track.stop();
    });

    mediaStream = null;
  }

  mediaRecorder = null;
  audioChunks = [];
}