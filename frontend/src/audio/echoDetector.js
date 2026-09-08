let audioContext = null;
let micAnalyser = null;
let micSource = null;

const FFT_SIZE = 2048;

// We expect speaker → room → microphone delay
// to normally fall somewhere in this range.
const MIN_DELAY_MS = 10;
const MAX_DELAY_MS = 350;

export function initializeEchoDetector(stream) {
  if (!stream) {
    throw new Error("Microphone stream is required");
  }

  if (audioContext) {
    return;
  }

  audioContext = new AudioContext();

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  micSource = audioContext.createMediaStreamSource(stream);

  micAnalyser = audioContext.createAnalyser();

  micAnalyser.fftSize = FFT_SIZE;
  micAnalyser.smoothingTimeConstant = 0;

  micSource.connect(micAnalyser);

  console.log("[ECHO] Detector initialized");
}

export function stopEchoDetector() {
  if (micSource) {
    try {
      micSource.disconnect();
    } catch {
      // Already disconnected.
    }
  }

  micSource = null;
  micAnalyser = null;
  audioContext = null;

  console.log("[ECHO] Detector stopped");
}

function getMicSamples() {
  if (!micAnalyser) {
    return null;
  }

  const data = new Float32Array(
    micAnalyser.fftSize
  );

  micAnalyser.getFloatTimeDomainData(data);

  return data;
}

function normalize(samples) {
  let energy = 0;

  for (let i = 0; i < samples.length; i++) {
    energy += samples[i] * samples[i];
  }

  const rms = Math.sqrt(
    energy / samples.length
  );

  if (rms < 0.00001) {
    return null;
  }

  const result = new Float32Array(
    samples.length
  );

  for (let i = 0; i < samples.length; i++) {
    result[i] = samples[i] / rms;
  }

  return result;
}

function correlation(a, b, offset) {
  const length = Math.min(
    a.length - offset,
    b.length
  );

  if (length <= 0) {
    return 0;
  }

  let sumA = 0;
  let sumB = 0;

  for (let i = 0; i < length; i++) {
    sumA += a[i + offset];
    sumB += b[i];
  }

  const meanA = sumA / length;
  const meanB = sumB / length;

  let numerator = 0;
  let denominatorA = 0;
  let denominatorB = 0;

  for (let i = 0; i < length; i++) {
    const da = a[i + offset] - meanA;
    const db = b[i] - meanB;

    numerator += da * db;
    denominatorA += da * da;
    denominatorB += db * db;
  }

  const denominator = Math.sqrt(
    denominatorA * denominatorB
  );

  if (denominator === 0) {
    return 0;
  }

  return numerator / denominator;
}

export function getEchoScore(referenceSamples) {
  const micSamples = getMicSamples();

  if (!micSamples || !referenceSamples) {
    return 0;
  }

  const mic = normalize(micSamples);
  const reference = normalize(referenceSamples);

  if (!mic || !reference) {
    return 0;
  }

  const sampleRate =
    audioContext?.sampleRate || 48000;

  const minOffset = Math.floor(
    (MIN_DELAY_MS / 1000) * sampleRate
  );

  const maxOffset = Math.min(
    Math.floor(
      (MAX_DELAY_MS / 1000) * sampleRate
    ),
    mic.length - 1
  );

  let best = 0;

  /*
   * Search over possible speaker → microphone delays.
   */
  for (
    let offset = minOffset;
    offset <= maxOffset;
    offset += 64
  ) {
    const score = Math.abs(
      correlation(
        mic,
        reference,
        offset
      )
    );

    if (score > best) {
      best = score;
    }
  }

  return best;
}

export function isLikelyEcho(referenceSamples) {
  const score = getEchoScore(referenceSamples);

  console.log(
    `[ECHO] correlation=${score.toFixed(3)}`
  );

  return score >= 0.65;
}