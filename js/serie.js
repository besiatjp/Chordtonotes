// ═══════════════════════════════════════
// serie.js — Gestion de la série
// ═══════════════════════════════════════

function resetSerie() {
  State.serieCorrect = 0;
  State.serieTotal   = 0;
  State.serieStats   = {};
  State.serieStart   = Date.now();
}

function showEndOverlay() {
  // Score
  const pct = State.serieTotal > 0
    ? Math.round(State.serieCorrect / State.serieTotal * 100)
    : 0;

  const scoreEl = document.getElementById('end-score');
  scoreEl.textContent = State.serieCorrect + '/' + State.serieTotal;
  scoreEl.style.color = pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--gold)' : 'var(--accent)';

  // Encouragement
  const encouragements = [
    { min:100, msg:'Parfait ! Série sans faute \uD83C\uDF89' },
    { min:80,  msg:'Excellent travail !' },
    { min:60,  msg:'Bien — continue ainsi.' },
    { min:40,  msg:'Courage, ça vient !' },
    { min:0,   msg:'À reprendre — ne te décourage pas.' },
  ];
  const enc = encouragements.find(e => pct >= e.min);
  document.getElementById('end-encouragement').textContent = enc ? enc.msg : '';

  // Temps
  const elapsed = Math.round((Date.now() - State.serieStart) / 1000);
  const min = Math.floor(elapsed / 60), sec = elapsed % 60;
  document.getElementById('end-time').textContent =
    (min > 0 ? min + 'min ' : '') + sec + 's';

  // Accord le plus raté
  let worstName = '—', worstRate = 1.1;
  for (const [idx, s] of Object.entries(State.serieStats)) {
    if (s.total > 0) {
      const rate = s.correct / s.total;
      if (rate < worstRate) {
        worstRate = rate;
        worstName = CHORDS[idx].name + ' — ' + CHORDS[idx].inv;
      }
    }
  }
  document.getElementById('end-worst').textContent = worstName;

  document.getElementById('end-overlay').classList.add('open');
}

function replaySerie() {
  document.getElementById('end-overlay').classList.remove('open');
  State.sequence = buildSequence(State.currentMode);
  State.seqPos = 0;
  State.currentIndex = State.sequence[0];
  resetSerie();
  updateProgress();
  showChord(State.currentIndex);
}

function endChooseMode() {
  document.getElementById('end-overlay').classList.remove('open');
  openModePanel();
}
