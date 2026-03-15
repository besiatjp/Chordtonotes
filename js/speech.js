// ═══════════════════════════════════════
// speech.js — Reconnaissance vocale
// ═══════════════════════════════════════

const NOTE_WORDS = {
  'do':'Do','d\u00f2':'Do','don':'Do','doh':'Do','du':'Do','tu':'Do','dou':'Do','dot':'Do','dop':'Do','dof':'Do',
  're':'R\u00e9','r\u00e9':'R\u00e9','r\u00e8':'R\u00e9','r\u00e9e':'R\u00e9',
  'mi':'Mi','m\u00ec':'Mi','mia':'Mi','mie':'Mi','me':'Mi',
  'fa':'Fa','f\u00e0':'Fa',
  'sol':'Sol','sole':'Sol',
  'la':'La','l\u00e0':'La',
  'si':'Si','s\u00ec':'Si',
};

const TRIGGERS = new Set(['note','nott\u00e9','notte','not','nota','noter','notes']);
const MIC_HINT = '\uD83C\uDFA4  "note do"  "note re"  "note sol" \u2026';

// On expose la référence pour que resetAnswer puisse l'arrêter
window._recognition = null;

function initSpeech() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    document.getElementById('btn-mic').classList.add('unavailable');
    return false;
  }

  const r = new SR();
  window._recognition = r;
  r.lang = 'it-IT';
  r.continuous = false;
  r.interimResults = true;
  r.maxAlternatives = 5;

  r.onstart = () => {
    State.micActive = true;
    document.getElementById('btn-mic').classList.add('listening');
    if (State.micAccumulated.length === 0) setFeedback('listening', MIC_HINT);
  };

  r.onend = () => {
    State.micActive = false;
    document.getElementById('btn-mic').classList.remove('listening');
    if (State.micShouldRestart) {
      const done = (State.currentExo === 'A' && State.notesAnswered) ||
                   (State.currentExo === 'B' && (State.bNotesOk || State.bAnswered));
      if (!done) { setTimeout(() => { try { r.start(); } catch(e) {} }, 120); return; }
    }
    const fb = document.getElementById('feedback');
    if (fb.classList.contains('listening')) { fb.textContent = ''; fb.className = ''; }
  };

  r.onerror = (e) => {
    if (e.error === 'no-speech' || e.error === 'aborted') {
      State.micActive = false;
      if (e.error === 'no-speech' && State.micShouldRestart) {
        const done = (State.currentExo === 'A' && State.notesAnswered) ||
                     (State.currentExo === 'B' && (State.bNotesOk || State.bAnswered));
        if (!done) { setTimeout(() => { try { r.start(); } catch(x) {} }, 120); return; }
      }
      return;
    }
    State.micActive = false;
    State.micShouldRestart = false;
    document.getElementById('btn-mic').classList.remove('listening');
    const msgs = { 'not-allowed':'Accès micro refusé', 'network':'Erreur réseau' };
    setFeedback('wrong', msgs[e.error] || 'Erreur micro');
    setTimeout(() => {
      const fb = document.getElementById('feedback');
      if (fb.textContent.includes('micro') || fb.textContent.includes('Accès')) {
        fb.textContent = ''; fb.className = '';
      }
    }, 2500);
  };

  r.onresult = (e) => {
    const all = [];
    for (let ri = 0; ri < e.results.length; ri++)
      for (let a = 0; a < e.results[ri].length; a++)
        all.push(e.results[ri][a].transcript.toLowerCase().trim());

    let best = [];
    for (const t of all) {
      const n = extractNotes(t);
      if (n.length > best.length) best = n;
    }

    for (const n of best)
      if (!State.micAccumulated.includes(n)) State.micAccumulated.push(n);

    if (State.micAccumulated.length > 0 && State.micAccumulated.length < 3) {
      const placed = placeOnStaff(State.micAccumulated).map(n => n || '·');
      setFeedback('listening', '\uD83C\uDFA4 ' + placed.join(' · ') + ' \u2026');
    }

    const isFinal = e.results[e.results.length - 1].isFinal;
    if (State.micAccumulated.length >= 3 || (isFinal && State.micAccumulated.length > 0)) {
      State.micShouldRestart = false;
      const toInject = [...State.micAccumulated];
      State.micAccumulated = [];
      r.stop();
      injectVoiceNotes(toInject);
    }
  };

  return true;
}

function extractNotes(transcript) {
  const found = [];
  const tokens = transcript.replace(/[,.'!?]/g, ' ').split(/\s+/).filter(Boolean);
  for (let i = 0; i < tokens.length; i++) {
    if (TRIGGERS.has(tokens[i]) && i + 1 < tokens.length) {
      const c = NOTE_WORDS[tokens[i + 1]];
      if (c && !found.includes(c)) found.push(c);
    }
  }
  if (found.length === 0) {
    for (const t of tokens) {
      const c = NOTE_WORDS[t];
      if (c && !found.includes(c)) found.push(c);
    }
  }
  return found;
}

function toggleMic() {
  if (!window._recognition && !initSpeech()) return;
  const r = window._recognition;
  if (State.micShouldRestart || State.micActive) {
    State.micShouldRestart = false;
    r.stop();
    document.getElementById('btn-mic').classList.remove('listening');
    const fb = document.getElementById('feedback');
    if (fb.classList.contains('listening')) { fb.textContent = ''; fb.className = ''; }
    return;
  }
  const done = (State.currentExo === 'A' && State.notesAnswered) ||
               (State.currentExo === 'B' && (State.bNotesOk || State.bAnswered));
  if (done) return;
  State.micShouldRestart = true;
  try { r.start(); } catch(e) {}
}
