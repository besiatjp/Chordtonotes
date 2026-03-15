// ═══════════════════════════════════════
// audio.js — Lecture audio (samples MP3)
// ═══════════════════════════════════════

const SAMPLES = {
  'A0':27.50,'C2':65.41,'A2':110.00,'C3':130.81,
  'A3':220.00,'C4':261.63,'A4':440.00,'C5':523.25,
  'A5':880.00,'C6':1046.50,'A6':1760.00,'C7':2093.00
};

const SOUNDS_URL = 'https://besiatjp.github.io/Chordtonotes/sounds/';

let _audioCtx    = null;
let _audioBuffers = {};
let _audioReady  = false;

function getAudioCtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

async function loadSamples() {
  if (_audioReady) return;
  const ctx = getAudioCtx();
  await Promise.all(Object.keys(SAMPLES).map(async name => {
    try {
      const resp = await fetch(SOUNDS_URL + name + '.mp3');
      const buf  = await resp.arrayBuffer();
      _audioBuffers[name] = await ctx.decodeAudioData(buf);
    } catch(e) { console.log('Sample manquant:', name); }
  }));
  _audioReady = true;
  console.log('Samples chargés:', Object.keys(_audioBuffers).length);
}

function findClosestSample(targetFreq) {
  let best = null, bestDist = Infinity;
  for (const [name, freq] of Object.entries(SAMPLES)) {
    if (!_audioBuffers[name]) continue;
    const dist = Math.abs(Math.log2(targetFreq / freq));
    if (dist < bestDist) { bestDist = dist; best = { name, freq }; }
  }
  return best;
}

function playSampleNote(targetFreq, startTime, duration) {
  const ctx = getAudioCtx();
  const closest = findClosestSample(targetFreq);
  if (!closest) return;

  const src = ctx.createBufferSource();
  src.buffer = _audioBuffers[closest.name];
  src.playbackRate.value = targetFreq / closest.freq;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.7, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  src.connect(gain);
  gain.connect(ctx.destination);
  src.start(startTime);
  src.stop(startTime + duration);
}

async function playChord(notes) {
  if (State.midiActive) return;
  await loadSamples();
  const ctx  = getAudioCtx();
  const now  = ctx.currentTime + 0.05;
  const arpDelay = 0.08;
  const duration = 2.5;

  notes.forEach((noteName, i) => {
    const freq = NOTE_FREQ[noteName];
    if (freq) playSampleNote(freq, now + i * arpDelay, duration);
  });
}
