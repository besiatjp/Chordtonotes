// ═══════════════════════════════════════
// modes.js — Modes pédagogiques et navigation
// ═══════════════════════════════════════

function shuffle(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

function buildSequence(mode) {
  const seq21 = Array.from({ length:21 }, (_, i) => i);
  const mixed = [0,3,6,9,12,15,18, 1,4,7,10,13,16,19, 2,5,8,11,14,17,20];
  const m = ((mode - 1) % 4) + 1;

  if (m === 1) return seq21;
  if (m === 2) return mixed;
  if (m === 3) return shuffle(seq21);

  // Mode 4 — Adaptatif
  const st = mode <= 4 ? State.statsA : State.statsB;
  const scores = [];
  for (let base = 0; base < 21; base += 3) {
    let errors = 0;
    for (let inv = 0; inv < 3; inv++) {
      const s = st[base + inv] || { correct:0, total:0 };
      if (s.total > 0) errors += (1 - s.correct / s.total);
    }
    scores.push({ base, score: errors });
  }
  scores.sort((a, b) => b.score - a.score);
  const seq = [];
  scores.forEach(({ base }) => seq.push(base, base + 1, base + 2));
  return seq;
}

// ── Panneau Mode ───────────────────────

function openModePanel() {
  for (let m = 1; m <= 8; m++) {
    const o = document.getElementById('mode-opt-' + m);
    if (o) o.classList.toggle('active', m === State.currentMode);
  }
  document.getElementById('mode-overlay').classList.add('open');
}

function closeModePanel() {
  document.getElementById('mode-overlay').classList.remove('open');
}

function setMode(mode, exo) {
  State.currentMode = mode;
  State.currentExo  = exo;
  State.sequence    = buildSequence(mode);
  State.seqPos      = 0;
  State.currentIndex = State.sequence[0];

  const mLabels = ['Séquentiel','Mélangé','Aléatoire','Adaptatif'];
  const mn = ((mode - 1) % 4);
  document.getElementById('mode-indicator').textContent =
    'Mode ' + (mn + 1) + ' — ' + mLabels[mn] + ' · Exo ' + exo;

  document.getElementById('chord-answer-zone').classList.toggle('visible', exo === 'B');

  const badge = document.getElementById('level-badge');
  if (exo === 'B') {
    badge.textContent = 'Niveau ' + State.exoBLevel;
    badge.classList.add('visible');
  } else {
    badge.classList.remove('visible');
  }

  closeModePanel();
  resetSerie();
  setTimeout(() => { showChord(State.currentIndex); updateProgress(); }, 50);
}

// ── Navigation ─────────────────────────

function nextChord() {
  State.seqPos++;
  if (State.seqPos >= State.sequence.length) {
    showEndOverlay();
    return;
  }
  State.currentIndex = State.sequence[State.seqPos];
  updateProgress();
  showChord(State.currentIndex);
}

function updateProgress() {
  document.getElementById('progress').textContent =
    (State.seqPos + 1) + ' / ' + State.sequence.length;
}
