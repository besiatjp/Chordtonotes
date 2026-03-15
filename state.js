// ═══════════════════════════════════════
// state.js — État global de l'application
// ═══════════════════════════════════════

// Navigation
const State = {
  // Mode et exercice
  currentMode:    1,
  currentExo:     'A',
  sequence:       [],
  seqPos:         0,
  currentIndex:   0,

  // Exercice A
  selectedNotes:  [],
  notesAnswered:  false,

  // Exercice B
  bNotesOk:       false,
  bChordChosen:   null,
  bAnswered:      false,
  exoBLevel:      1,

  // Auto-avance et grâce
  autoAdvance:    false,
  gracePeriod:    3000,
  graceTimer:     null,
  inGrace:        false,

  // MIDI
  midiActive:     false,
  midiAccumulated:[],

  // Voix
  micActive:      false,
  micShouldRestart: false,
  micAccumulated: [],

  // Stats globales (persistées)
  statsA: {},
  statsB: {},

  // Stats série en cours (réinitialisées à chaque série)
  serieCorrect:   0,
  serieTotal:     0,
  serieStart:     null,
  serieStats:     {},

  // Niveau B
  LEVEL2_THRESHOLD: 0.80,
};
