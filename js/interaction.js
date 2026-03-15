// ═══════════════════════════════════════
// interaction.js — Exercices A et B
// ═══════════════════════════════════════

// ── Utilitaires UI ────────────────────

function setFeedback(cls, msg) {
  const fb = document.getElementById('feedback');
  fb.textContent = msg;
  fb.className = cls;
}

function updateSlots(arr) {
  ['slot-0','slot-1','slot-2'].forEach((id, i) => {
    const e = document.getElementById(id);
    if (arr[i]) { e.textContent = arr[i]; e.classList.add('filled'); }
    else        { e.textContent = '—';    e.classList.remove('filled'); }
  });
}

function placeOnStaff(detectedNames) {
  const expected = CHORDS[State.currentIndex].notes.map(n => n.replace(/\d/, ''));
  return expected.map(exp => detectedNames.includes(exp) ? exp : null);
}

// ── Reset ─────────────────────────────

function resetAnswer() {
  // Stopper le micro si actif
  if (State.micActive && window._recognition) window._recognition.stop();

  // Vider les accumulateurs
  State.micAccumulated  = [];
  State.midiAccumulated = [];

  // Réinitialiser l'état
  State.selectedNotes  = [];
  State.notesAnswered  = false;
  State.bNotesOk       = false;
  State.bChordChosen   = null;
  State.bAnswered      = false;

  // UI
  updateSlots([]);
  setFeedback('', '');
  document.querySelectorAll('.note-btn').forEach(b => {
    b.classList.remove('selected');
    b.disabled = false;
  });

  const bp = document.getElementById('btn-chord-pick');
  bp.textContent = 'Quel accord ?';
  bp.classList.remove('chosen');
  if (State.currentExo === 'B') {
    bp.style.opacity = '0.4';
    bp.style.pointerEvents = 'none';
  }
  document.getElementById('chord-dropdown').classList.remove('open');

  // Annuler la grâce en cours
  endGrace();
}

// ── Grâce ─────────────────────────────

function startGrace(andAdvance) {
  State.inGrace = true;
  if (State.graceTimer) clearTimeout(State.graceTimer);
  State.graceTimer = setTimeout(() => {
    State.inGrace  = false;
    State.graceTimer = null;
    if (andAdvance) nextChord();
  }, State.gracePeriod);
}

function endGrace() {
  State.inGrace = false;
  if (State.graceTimer) {
    clearTimeout(State.graceTimer);
    State.graceTimer = null;
  }
}

// ── Toggle Auto ───────────────────────

function toggleAuto() {
  State.autoAdvance = !State.autoAdvance;
  document.getElementById('toggle-auto').classList.toggle('on', State.autoAdvance);
  document.getElementById('grace-inline').classList.toggle('visible', State.autoAdvance);
}

function updateGrace(val) {
  State.gracePeriod = val * 1000;
  document.getElementById('grace-val-inline').textContent = val + 's';
}

// ── Affichage accord ──────────────────

function showChord(index) {
  const chord = CHORDS[index];
  if (State.currentExo === 'A') {
    document.getElementById('chord-title').textContent = 'Accord de ' + chord.name;
    document.getElementById('inversion-label').textContent = chord.inv;
  } else {
    document.getElementById('chord-title').textContent = '?';
    document.getElementById('inversion-label').textContent =
      State.exoBLevel === 2 ? '— nom et inversion —' : '— nom de l\'accord —';
    // Jouer l'accord en découverte (Exo B)
    setTimeout(() => playChord(chord.notes), 300);
  }
  resetAnswer();
  renderStaff(chord);
}

// ── Injection notes (voix/MIDI) ───────

function pushNote(name) {
  State.selectedNotes.push(name);
  updateSlots(State.selectedNotes);
  document.querySelectorAll('.note-btn').forEach(b => {
    if (b.textContent === name) b.classList.add('selected');
  });
}

function removeNote(name) {
  State.selectedNotes = State.selectedNotes.filter(n => n !== name);
  updateSlots(State.selectedNotes);
  document.querySelectorAll('.note-btn').forEach(b => {
    if (b.textContent === name) b.classList.remove('selected');
  });
}

function injectVoiceNotes(detectedNames) {
  if (State.selectedNotes.length > 0) resetAnswer();
  const expected = CHORDS[State.currentIndex].notes.map(n => n.replace(/\d/, ''));
  const ordered  = expected.filter(exp => detectedNames.includes(exp));
  for (const name of ordered) {
    if (State.selectedNotes.length >= 3) break;
    if (State.selectedNotes.includes(name)) continue;
    if (State.currentExo === 'B') {
      if (State.bNotesOk || State.bAnswered) break;
      pushNote(name);
    } else {
      if (State.notesAnswered) break;
      pushNote(name);
    }
  }
  if (State.selectedNotes.length === 3) {
    if (State.currentExo === 'B') validateBNotes();
    else validateA();
  }
}

// ── Exercice A ────────────────────────

function selectNote(name) {
  if (State.currentExo === 'B') { selectNoteB(name); return; }
  if (State.notesAnswered) return;
  if (State.selectedNotes.includes(name)) { removeNote(name); return; }
  if (State.selectedNotes.length >= 3) return;
  pushNote(name);
  if (State.selectedNotes.length === 3) validateA();
}

function validateA() {
  State.notesAnswered = true;
  const exp = CHORDS[State.currentIndex].notes.map(n => n.replace(/\d/, ''));
  const ok  = State.selectedNotes.every((n, i) => n === exp[i]);

  setFeedback(ok ? 'correct' : 'wrong', ok ? '✔ Correct !' : '✘  ' + exp.join(' · '));
  recordStat(true, State.currentIndex, ok);
  checkUnlockA();
  document.querySelectorAll('.note-btn').forEach(b => b.disabled = true);

  if (ok) {
    playChord(CHORDS[State.currentIndex].notes);
    startGrace(State.autoAdvance);
  }
}

// ── Exercice B ────────────────────────

function selectNoteB(name) {
  if (State.bNotesOk || State.bAnswered) return;
  if (State.selectedNotes.includes(name)) { removeNote(name); return; }
  if (State.selectedNotes.length >= 3) return;
  pushNote(name);
  if (State.selectedNotes.length === 3) validateBNotes();
}

function validateBNotes() {
  const exp = CHORDS[State.currentIndex].notes.map(n => n.replace(/\d/, ''));
  const ok  = State.selectedNotes.every((n, i) => n === exp[i]);
  document.querySelectorAll('.note-btn').forEach(b => b.disabled = true);

  if (ok) {
    State.bNotesOk = true;
    setFeedback('partial', '✔ Notes correctes — identifie l\'accord');
    const bp = document.getElementById('btn-chord-pick');
    bp.style.opacity = '1';
    bp.style.pointerEvents = 'auto';
  } else {
    setFeedback('wrong', '✘  ' + exp.join(' · '));
    State.bAnswered = true;
    recordStat(false, State.currentIndex, false);
    checkUnlockB();
  }
}

function toggleChordDropdown() {
  if (!State.bNotesOk || State.bAnswered) return;
  const dd = document.getElementById('chord-dropdown');
  if (dd.classList.contains('open')) { dd.classList.remove('open'); return; }
  buildChordDropdown();
  // Ouvrir vers le haut pour éviter de dépasser le bas de l'écran
  const btn = document.getElementById('btn-chord-pick');
  const rect = btn.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  if (spaceBelow < 320) {
    dd.style.top = 'auto';
    dd.style.bottom = '100%';
    dd.style.marginBottom = '4px';
    dd.style.marginTop = '0';
  } else {
    dd.style.top = '100%';
    dd.style.bottom = 'auto';
    dd.style.marginTop = '4px';
    dd.style.marginBottom = '0';
  }
  dd.classList.add('open');
}

function buildChordDropdown() {
  const dd = document.getElementById('chord-dropdown');
  dd.innerHTML = '';
  CHORD_NAMES.forEach(cn => {
    const item = document.createElement('div');
    item.className = 'chord-option';
    if (State.exoBLevel === 1) {
      item.textContent = cn;
      item.onclick = () => selectChordAnswer(cn, null);
    } else {
      item.textContent = cn + ' ›';
      const sub = document.createElement('div');
      sub.className = 'inv-submenu';
      INV_NAMES.forEach(inv => {
        const ii = document.createElement('div');
        ii.className = 'inv-option';
        ii.textContent = inv;
        ii.onclick = (e) => { e.stopPropagation(); selectChordAnswer(cn, inv); };
        sub.appendChild(ii);
      });
      item.appendChild(sub);
      item.onclick = () => {
        document.querySelectorAll('.inv-submenu').forEach(s => { if (s !== sub) s.classList.remove('open'); });
        sub.classList.toggle('open');
      };
    }
    dd.appendChild(item);
  });
}

function selectChordAnswer(cn, inv) {
  State.bChordChosen = { name: cn, inv };
  const lbl = inv ? cn + ' · ' + inv : cn;
  const btn = document.getElementById('btn-chord-pick');
  btn.textContent = lbl;
  btn.classList.add('chosen');
  document.getElementById('chord-dropdown').classList.remove('open');
  validateBChord();
}

function validateBChord() {
  State.bAnswered = true;
  const chord = CHORDS[State.currentIndex];
  let ok = State.bChordChosen.name === chord.name;
  if (State.exoBLevel === 2 && ok) ok = State.bChordChosen.inv === chord.inv;

  const lbl = State.exoBLevel === 2
    ? chord.name + ' · ' + chord.inv
    : chord.name;
  setFeedback(ok ? 'correct' : 'wrong', ok ? '✔ Correct !' : '✘  ' + lbl);
  document.getElementById('chord-title').textContent = 'Accord de ' + chord.name;
  document.getElementById('inversion-label').textContent = chord.inv;

  recordStat(false, State.currentIndex, ok);
  checkUnlockB();
  checkLevelUp();

  if (ok) {
    playChord(chord.notes);
    startGrace(State.autoAdvance);
  }
}

// ── Niveau auto (Exo B) ───────────────

function checkLevelUp() {
  if (State.exoBLevel === 2) return;
  const total   = Object.values(State.statsB).reduce((s, v) => s + v.total, 0);
  if (total < 21) return;
  const correct = Object.values(State.statsB).reduce((s, v) => s + v.correct, 0);
  if (correct / total >= State.LEVEL2_THRESHOLD) {
    State.exoBLevel = 2;
    document.getElementById('level-badge').textContent = 'Niveau 2';
    showToast('Niveau 2 débloqué — identifie maintenant les inversions !');
  }
}

function showToast(msg) {
  const t = document.getElementById('level-toast');
  t.textContent = msg;
  t.style.display = 'block';
  setTimeout(() => { t.style.display = 'none'; }, 3500);
}
