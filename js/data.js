// ═══════════════════════════════════════
// data.js — Données statiques
// ═══════════════════════════════════════

const NOTE_INDEX = {
  'Do4':-1,'Ré4':0,'Mi4':1,'Fa4':2,'Sol4':3,'La4':4,'Si4':5,
  'Do5':6,'Ré5':7,'Mi5':8,'Fa5':9,'Sol5':10,
  'La5':11,'Si5':12,'Do6':13,'Ré6':14
};

const CHORDS = [
  {name:'Do majeur', inv:'Position fondamentale', notes:['Do4','Mi4','Sol4']},
  {name:'Do majeur', inv:'1ère inversion',        notes:['Mi4','Sol4','Do5']},
  {name:'Do majeur', inv:'2ème inversion',        notes:['Sol4','Do5','Mi5']},
  {name:'Ré mineur', inv:'Position fondamentale', notes:['Ré4','Fa4','La4']},
  {name:'Ré mineur', inv:'1ère inversion',        notes:['Fa4','La4','Ré5']},
  {name:'Ré mineur', inv:'2ème inversion',        notes:['La4','Ré5','Fa5']},
  {name:'Mi mineur', inv:'Position fondamentale', notes:['Mi4','Sol4','Si4']},
  {name:'Mi mineur', inv:'1ère inversion',        notes:['Sol4','Si4','Mi5']},
  {name:'Mi mineur', inv:'2ème inversion',        notes:['Si4','Mi5','Sol5']},
  {name:'Fa majeur', inv:'Position fondamentale', notes:['Fa4','La4','Do5']},
  {name:'Fa majeur', inv:'1ère inversion',        notes:['La4','Do5','Fa5']},
  {name:'Fa majeur', inv:'2ème inversion',        notes:['Do5','Fa5','La5']},
  {name:'Sol majeur',inv:'Position fondamentale', notes:['Sol4','Si4','Ré5']},
  {name:'Sol majeur',inv:'1ère inversion',        notes:['Si4','Ré5','Sol5']},
  {name:'Sol majeur',inv:'2ème inversion',        notes:['Ré5','Sol5','Si5']},
  {name:'La mineur', inv:'Position fondamentale', notes:['La4','Do5','Mi5']},
  {name:'La mineur', inv:'1ère inversion',        notes:['Do5','Mi5','La5']},
  {name:'La mineur', inv:'2ème inversion',        notes:['Mi5','La5','Do6']},
  {name:'Si diminué',inv:'Position fondamentale', notes:['Si4','Ré5','Fa5']},
  {name:'Si diminué',inv:'1ère inversion',        notes:['Ré5','Fa5','Si5']},
  {name:'Si diminué',inv:'2ème inversion',        notes:['Fa5','Si5','Ré6']},
];

const CHORD_NAMES = [
  'Do majeur','Ré mineur','Mi mineur','Fa majeur',
  'Sol majeur','La mineur','Si diminué'
];

const INV_NAMES = [
  'Position fondamentale','1ère inversion','2ème inversion'
];

// Fréquences exactes pour l'audio
const NOTE_FREQ = {
  'Do4':261.63,'Ré4':293.66,'Mi4':329.63,'Fa4':349.23,
  'Sol4':392.00,'La4':440.00,'Si4':493.88,
  'Do5':523.25,'Ré5':587.33,'Mi5':659.25,'Fa5':698.46,
  'Sol5':783.99,'La5':880.00,'Si5':987.77,
  'Do6':1046.50,'Ré6':1174.66
};
