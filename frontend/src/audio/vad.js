let myVAD = null;

export async function startVAD({ onSpeechStart, onSpeechEnd }) {
  if (myVAD) {
    return;
  }

  if (!window.vad) {
    throw new Error("vad-web bundle was not loaded");
  }

  console.log("[VAD] Initializing browser Silero VAD...");

  myVAD = await window.vad.MicVAD.new({
    onSpeechStart: () => {
      console.log("[VAD] Speech started");
      onSpeechStart?.();
    },

    onSpeechEnd: (audio) => {
      console.log("[VAD] Speech ended", audio.length);
      onSpeechEnd?.(audio);
    },

    baseAssetPath: "/vad/",
    onnxWASMBasePath: "/vad/",
  });

  myVAD.start();

  console.log("[VAD] Started");
}

export async function stopVAD() {
  if (!myVAD) {
    return;
  }

  myVAD.pause();
  myVAD.destroy();

  myVAD = null;

  console.log("[VAD] Stopped");
}