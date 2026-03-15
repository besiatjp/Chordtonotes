// ═══════════════════════════════════════
// midi.js — WebMIDI
// ═══════════════════════════════════════

function midiNoteToName(n) {
  const classes = { 0:'Do', 2:'Ré', 4:'Mi', 5:'Fa', 7:'Sol', 9:'La', 11:'Si' };
  return classes[n % 12] || null;
}

function initMIDI() {
  if (!navigator.requestMIDIAccess) {
    console.log('Web MIDI non disponible');
    return;
  }
  navigator.requestMIDIAccess().then(
    ma => { connectMIDIInputs(ma); ma.onstatechange = () => connectMIDIInputs(ma); },
    e  => console.log('MIDI refusé:', e)
  );
}

function connectMIDIInputs(ma) {
  let count = 0;
  ma.inputs.forEach(inp => { inp.onmidimessage = onMIDIMessage; count++; });
  const st = document.getElementById('midi-status');
  const lb = document.getElementById('midi-label');
  if (count > 0) {
    State.midiActive = true;
    st.classList.add('visible', 'connected');
    lb.textContent = 'Piano connecté';
  } else {
    State.midiActive = false;
    st.classList.remove('visible', 'connected', 'active');
  }
}

function onMIDIMessage(e) {
  const [st, note, vel] = e.data;
  if ((st & 0xF0) !== 0x90 || vel === 0) return;
  if (State.inGrace) return;

  const done = (State.currentExo === 'A' && State.notesAnswered) ||
               (State.currentExo === 'B' && (State.bNotesOk || State.bAnswered));
  if (done) return;

  const name = midiNoteToName(note);
  if (!name) return;
  if (State.midiAccumulated.includes(name)) return;

  State.midiAccumulated.push(name);

  const ms = document.getElementById('midi-status');
  ms.classList.add('active');
  setTimeout(() => ms.classList.remove('active'), 300);

  const placed = placeOnStaff(State.midiAccumulated).map(n => n || '·');
  setFeedback('listening', '\uD83C\uDFB9 ' + placed.join(' · '));

  if (State.midiAccumulated.length >= 3) {
    const ti = [...State.midiAccumulated];
    State.midiAccumulated = [];
    setTimeout(() => injectVoiceNotes(ti), 150);
  }
}
