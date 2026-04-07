// ═══════════════════════════════════════
// staff.js — Rendu grand staff SVG
// ═══════════════════════════════════════
const SVG_W = 680, SVG_H = 380, LS = 18, NR = 9;
const SX = 78, SX2 = 630, SMX = (SX + SX2) / 2;
const SMX_FA = SMX - 40; // note basse légèrement à gauche du centre

// Portée Sol : ligne 1 (Mi4) à Y=120
const Y_G1 = 120;
function noteY(i) { return Y_G1 - i * (LS / 2); }

// Portée Fa : ligne 1 (Si2) à Y=280
// i=0 → Si2 (ligne 1), i=1 → espace, i=2 → ligne 2 (Ré3)...
const Y_F1 = 280;
function noteYfa(i) { return Y_F1 - (i - 1) * (LS / 2); }

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
  const topY = noteY(9);
  const botY = Y_F1;

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

  // Do4 en pointillés (ligne de séparation entre les deux portées)
  svg.appendChild(el('line', {
    x1:SMX-22, y1:noteY(-1), x2:SMX+22, y2:noteY(-1),
    stroke:'#2C2620', 'stroke-width':'1', 'stroke-dasharray':'3,3', opacity:'0.4'
  }));

  // ── Lignes supplémentaires portée Sol ──
  function ledger(idx) {
    const lw = 46, lines = [];
    if (idx <= -1) for (let l = -1; l >= idx; l -= 2) lines.push(l);
    if (idx >= 10) for (let l = 11; l <= idx; l += 2) lines.push(l);
    lines.forEach(l => {
      if (l === -1) return;
      svg.appendChild(el('line', { x1:SMX-lw/2, y1:noteY(l), x2:SMX+lw/2, y2:noteY(l), stroke:'#2C2620', 'stroke-width':'1.2' }));
    });
  }

  // ── Notes portée Sol ──
  const idxs = chord.notes.map(n => NOTE_INDEX[n]);
  const maxI = Math.max(...idxs), minI = Math.min(...idxs);
  idxs.forEach(i => {
    ledger(i);
    svg.appendChild(el('ellipse', { cx:SMX, cy:noteY(i), rx:NR, ry:NR*.75, fill:'#1A1612' }));
  });

  // Hampe portée Sol
  const up = idxs[1] <= 5, ni = up ? maxI : minI, cy = noteY(ni);
  const sx = up ? SMX + NR - 1 : SMX - NR + 1;
  svg.appendChild(el('line', { x1:sx, y1:cy, x2:sx, y2:up ? cy-LS*3.5 : cy+LS*3.5, stroke:'#1A1612', 'stroke-width':'1.5' }));

  // ── Note basse portée Fa ──
  if (chord.bass && NOTE_INDEX_FA[chord.bass] !== undefined) {
    const fi = NOTE_INDEX_FA[chord.bass];
    const fy = noteYfa(fi);
    const lw = 46;

    // Lignes supplémentaires sous la portée Fa (Sol2=-2, La2=-1)
    // La ligne 1 de la portée Fa est Si2 (fi=0), à Y_F1
    // Pour fi<0, on dessine des lignes supplémentaires sous la portée
    if (fi < 0) {
      // La2 (fi=-1) : 1 ligne supplémentaire sous la portée
      // Sol2 (fi=-2) : 1 ligne supplémentaire + la note est dans l'espace en dessous
      // On dessine une ligne pour chaque valeur paire <= fi (sens portée Fa)
      // fi=-1 (La2) → on dessine ligne à fi=0 (Si2, sous portée)
      // fi=-2 (Sol2) → on dessine ligne à fi=0 et fi=-2
      for (let l = 0; l >= fi; l--) {
        if (l % 2 === 0) { // positions paires = sur une ligne
          // Sol2 est sur l=-2, La2 est dans l'espace l=-1
          // On dessine la ligne Si2 (l=0) pour La2 et Sol2
          // On dessine aussi la ligne Sol2 (l=-2) pour Sol2
          const ly = noteYfa(l);
          svg.appendChild(el('line', {
            x1: SMX_FA - lw/2, y1: ly,
            x2: SMX_FA + lw/2, y2: ly,
            stroke:'#2C2620', 'stroke-width':'1.2'
          }));
        }
      }
    }

    // La note elle-même
    svg.appendChild(el('ellipse', { cx:SMX_FA, cy:fy, rx:NR, ry:NR*.75, fill:'#1A1612' }));

    // Hampe vers le haut (convention note basse isolée)
    const hx = SMX_FA + NR - 1;
    svg.appendChild(el('line', {
      x1:hx, y1:fy,
      x2:hx, y2:fy - LS*3.5,
      stroke:'#1A1612', 'stroke-width':'1.5'
    }));
  }
}
