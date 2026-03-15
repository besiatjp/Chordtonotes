// ═══════════════════════════════════════
// staff.js — Rendu grand staff SVG
// ═══════════════════════════════════════

const SVG_W = 680, SVG_H = 380, LS = 18, NR = 9;
const SX = 78, SX2 = 630, SMX = (SX + SX2) / 2;

// Portée Sol : ligne 1 (Mi4) à Y=120
const Y_G1 = 120;
function noteY(i) { return Y_G1 - i * (LS / 2); }

// Portée Fa : ligne 1 à Y=280
const Y_F1 = 280;

function renderStaff(chord) {
  const svg = document.getElementById('staff-svg');
  svg.innerHTML = '';
  const ns = 'http://www.w3.org/2000/svg';
  const el = (t, a) => {
    const e = document.createElementNS(ns, t);
    Object.entries(a).forEach(([k, v]) => e.setAttribute(k, v));
    return e;
  };

  // Fond
  svg.appendChild(el('rect', { x:0, y:0, width:SVG_W, height:SVG_H, fill:'#F7F4EE', rx:4 }));

  // Bornes du grand staff
  const topY = noteY(9);   // Fa5
  const botY = Y_F1;       // ligne 1 Fa

  // Accolade gauche
  const bx = 16, midY = (topY + botY) / 2, h = (botY - topY) / 2;
  const d = [
    'M ' + bx + ' ' + midY,
    'C ' + (bx-16) + ' ' + (midY-h*.3) + ' ' + (bx-12) + ' ' + (topY+10) + ' ' + bx + ' ' + topY,
    'C ' + (bx+9)  + ' ' + (topY-7)    + ' ' + (bx+11)  + ' ' + (topY+5)  + ' ' + bx + ' ' + midY,
    'C ' + (bx-16) + ' ' + (midY+h*.3) + ' ' + (bx-12)  + ' ' + (botY-10) + ' ' + bx + ' ' + botY,
    'C ' + (bx+9)  + ' ' + (botY+7)    + ' ' + (bx+11)  + ' ' + (botY-5)  + ' ' + bx + ' ' + midY,
    'Z'
  ].join(' ');
  svg.appendChild(el('path', { d, fill:'#1A1612' }));

  // Double barre de début
  svg.appendChild(el('line', { x1:SX-7, y1:topY, x2:SX-7, y2:botY, stroke:'#1A1612', 'stroke-width':'2.8' }));
  svg.appendChild(el('line', { x1:SX-3, y1:topY, x2:SX-3, y2:botY, stroke:'#1A1612', 'stroke-width':'1.1' }));

  // Barre droite
  svg.appendChild(el('line', { x1:SX2, y1:topY, x2:SX2, y2:botY, stroke:'#1A1612', 'stroke-width':'1.2' }));

  // 5 lignes portée Sol
  [1,3,5,7,9].forEach(i =>
    svg.appendChild(el('line', { x1:SX, y1:noteY(i), x2:SX2, y2:noteY(i), stroke:'#2C2620', 'stroke-width':'1.2' }))
  );

  // Clé de Sol
  const gc = el('text', { x:46, y:noteY(5)+26, 'font-size':'64', 'font-family':'serif', fill:'#1A1612', 'text-anchor':'middle' });
  gc.textContent = '\uD834\uDD1E';
  svg.appendChild(gc);

  // 5 lignes portée Fa
  [1,3,5,7,9].forEach(i => {
    const y = Y_F1 - i * (LS / 2);
    svg.appendChild(el('line', { x1:SX, y1:y, x2:SX2, y2:y, stroke:'#2C2620', 'stroke-width':'1.2' }));
  });

  // Clé de Fa
  const fc = el('text', { x:46, y:Y_F1-4*(LS/2)+4, 'font-size':'42', 'font-family':'serif', fill:'#1A1612', 'text-anchor':'middle' });
  fc.textContent = '\uD834\uDD22';
  svg.appendChild(fc);
  svg.appendChild(el('circle', { cx:60, cy:Y_F1-5*(LS/2), r:'3.5', fill:'#1A1612' }));
  svg.appendChild(el('circle', { cx:60, cy:Y_F1-4*(LS/2), r:'3.5', fill:'#1A1612' }));

  // Do4 en pointillés
  svg.appendChild(el('line', {
    x1:SMX-22, y1:noteY(-1), x2:SMX+22, y2:noteY(-1),
    stroke:'#2C2620', 'stroke-width':'1', 'stroke-dasharray':'3,3', opacity:'0.4'
  }));

  // Lignes supplémentaires
  function ledger(idx) {
    const lw = 46, lines = [];
    if (idx <= -1) for (let l = -1; l >= idx; l -= 2) lines.push(l);
    if (idx >= 10) for (let l = 11; l <= idx; l += 2) lines.push(l);
    lines.forEach(l => {
      if (l === -1) return;
      svg.appendChild(el('line', { x1:SMX-lw/2, y1:noteY(l), x2:SMX+lw/2, y2:noteY(l), stroke:'#2C2620', 'stroke-width':'1.2' }));
    });
  }

  // Notes
  const idxs = chord.notes.map(n => NOTE_INDEX[n]);
  const maxI = Math.max(...idxs), minI = Math.min(...idxs);
  idxs.forEach(i => {
    ledger(i);
    svg.appendChild(el('ellipse', { cx:SMX, cy:noteY(i), rx:NR, ry:NR*.75, fill:'#1A1612' }));
  });

  // Hampe
  const up = idxs[1] <= 5, ni = up ? maxI : minI, cy = noteY(ni);
  const sx = up ? SMX + NR - 1 : SMX - NR + 1;
  svg.appendChild(el('line', { x1:sx, y1:cy, x2:sx, y2:up ? cy-LS*3.5 : cy+LS*3.5, stroke:'#1A1612', 'stroke-width':'1.5' }));
}
