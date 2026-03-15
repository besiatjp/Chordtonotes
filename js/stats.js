// ═══════════════════════════════════════
// stats.js — Statistiques et persistance
// ═══════════════════════════════════════

function loadStats() {
  try {
    const a = localStorage.getItem('chordtonotes_statsA');
    const b = localStorage.getItem('chordtonotes_statsB');
    if (a) Object.assign(State.statsA, JSON.parse(a));
    if (b) Object.assign(State.statsB, JSON.parse(b));
  } catch(e) { console.log('Erreur chargement stats:', e); }
}

function saveStats() {
  try {
    localStorage.setItem('chordtonotes_statsA', JSON.stringify(State.statsA));
    localStorage.setItem('chordtonotes_statsB', JSON.stringify(State.statsB));
  } catch(e) { console.log('Erreur sauvegarde stats:', e); }
}

function recordStat(isExoA, idx, ok) {
  // Stats globales (persistées)
  const obj = isExoA ? State.statsA : State.statsB;
  if (!obj[idx]) obj[idx] = { correct:0, total:0 };
  obj[idx].total++;
  if (ok) obj[idx].correct++;
  saveStats();

  // Stats série en cours
  if (!State.serieStats[idx]) State.serieStats[idx] = { correct:0, total:0 };
  State.serieStats[idx].total++;
  if (ok) State.serieStats[idx].correct++;
  State.serieTotal++;
  if (ok) State.serieCorrect++;
}

function checkUnlockA() {
  const t = Object.values(State.statsA).reduce((s, v) => s + v.total, 0);
  if (t >= 21) {
    const o = document.getElementById('mode-opt-4');
    if (o) o.classList.remove('disabled-mode');
  }
}

function checkUnlockB() {
  const t = Object.values(State.statsB).reduce((s, v) => s + v.total, 0);
  if (t >= 21) {
    const o = document.getElementById('mode-opt-8');
    if (o) o.classList.remove('disabled-mode');
  }
}

// ── Panneau Stats ──────────────────────

let currentStatsTab = 'A';

function openStats() {
  renderStatsPanel(currentStatsTab);
  document.getElementById('stats-overlay').classList.add('open');
}

function closeStats() {
  document.getElementById('stats-overlay').classList.remove('open');
}

function switchStatsTab(tab) {
  currentStatsTab = tab;
  document.getElementById('tab-a').classList.toggle('active', tab === 'A');
  document.getElementById('tab-b').classList.toggle('active', tab === 'B');
  renderStatsPanel(tab);
}

function renderStatsPanel(tab) {
  const st = tab === 'A' ? State.statsA : State.statsB;
  const total = Object.values(st).reduce((s, v) => s + v.total, 0);
  const ok    = Object.values(st).reduce((s, v) => s + v.correct, 0);

  const rEl = document.getElementById('global-rate');
  const cEl = document.getElementById('global-count');

  if (total === 0) {
    rEl.textContent = '—';
    rEl.style.color = 'var(--muted)';
  } else {
    const p = Math.round(ok / total * 100);
    rEl.textContent = p + '%';
    rEl.style.color = p >= 80 ? 'var(--green)' : p >= 50 ? 'var(--gold)' : 'var(--accent)';
  }
  cEl.textContent = total + ' réponse' + (total > 1 ? 's' : '');

  const table = document.getElementById('stats-table');
  table.innerHTML = '';

  if (total === 0) {
    const nd = document.createElement('div');
    nd.className = 'stat-no-data';
    nd.textContent = 'Aucune donnée pour cet exercice.';
    table.appendChild(nd);
    return;
  }

  for (let base = 0; base < 21; base += 3) {
    const grp = document.createElement('div');
    grp.className = 'stat-chord-group';
    const lbl = document.createElement('div');
    lbl.className = 'stat-chord-label';
    lbl.textContent = CHORDS[base].name;
    grp.appendChild(lbl);

    for (let inv = 0; inv < 3; inv++) {
      const idx = base + inv;
      const s = st[idx] || { correct:0, total:0 };
      const row = document.createElement('div');
      row.className = 'stat-row';

      const nm = document.createElement('div');
      nm.className = 'stat-row-name';
      nm.textContent = CHORDS[idx].inv;
      row.appendChild(nm);

      const track = document.createElement('div');
      track.className = 'stat-bar-track';
      const fill = document.createElement('div');
      if (s.total === 0) {
        fill.className = 'stat-bar-fill bar-none';
      } else {
        const p = Math.round(s.correct / s.total * 100);
        fill.className = 'stat-bar-fill ' + (p >= 80 ? 'bar-high' : p >= 50 ? 'bar-mid' : 'bar-low');
        fill.style.width = p + '%';
      }
      track.appendChild(fill);
      row.appendChild(track);

      const pEl = document.createElement('div');
      pEl.className = 'stat-pct';
      pEl.textContent = s.total === 0 ? '—' : Math.round(s.correct / s.total * 100) + '%';
      row.appendChild(pEl);
      grp.appendChild(row);
    }
    table.appendChild(grp);
  }
}

function confirmReset() {
  const tab = currentStatsTab;
  if (!confirm('Réinitialiser les stats de l\'Exercice ' + tab + ' ?')) return;
  if (tab === 'A') {
    Object.keys(State.statsA).forEach(k => delete State.statsA[k]);
    localStorage.removeItem('chordtonotes_statsA');
  } else {
    Object.keys(State.statsB).forEach(k => delete State.statsB[k]);
    localStorage.removeItem('chordtonotes_statsB');
  }
  saveStats();
  renderStatsPanel(tab);
}
