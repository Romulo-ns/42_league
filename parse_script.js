const fs = require('fs');

const raw = fs.readFileSync('raw_schedule.txt', 'utf8').split('\n').map(l => l.trim());

const groupTeams = {
  A: [], B: [], C: [], D: [], E: [], F: [], G: [], H: [], I: [], J: [], K: [], L: []
};

const matches = [];
let matchId = 1;

function getCleanTeam(str) {
  if (str === 'A determ.') return { name: 'TBD', flag: 'un' };
  
  // Example: MéxicoMéxico -> México
  // It seems the string is duplicated if the first half exactly matches the second half.
  const half = Math.floor(str.length / 2);
  if (str.substring(0, half) === str.substring(half)) {
    str = str.substring(0, half);
  } else if (str === 'Bósnia e HerzegovinaBósnia e Herzegovina') {
    str = 'Bósnia e Herz.';
  } else if (str === 'Costa do MarfimCosta do Marfim') {
    str = 'Costa do Marfim';
  } else if (str === 'Arábia SauditaArábia Saudita') {
    str = 'Arábia Saudita';
  } else if (str === 'Nova ZelândiaNova Zelândia') {
    str = 'Nova Zelândia';
  } else if (str === 'RD CongoRD Congo') {
    str = 'RD Congo';
  } else if (str === 'Estados UnidosEstados Unidos') {
    str = 'Estados Unidos';
  } else if (str === 'África do SulÁfrica do Sul') {
    str = 'África do Sul';
  }
  
  // Find flag for string
  let flag = "un";
  const map = {
    'México': 'mx', 'África do Sul': 'za', 'Coreia do Sul': 'kr', 'Tchéquia': 'cz',
    'Canadá': 'ca', 'Bósnia e Herz.': 'ba', 'Catar': 'qa', 'Suíça': 'ch',
    'Brasil': 'br', 'Marrocos': 'ma', 'Haiti': 'ht', 'Escócia': 'gb-sct',
    'Estados Unidos': 'us', 'Paraguai': 'py', 'Austrália': 'au', 'Turquia': 'tr',
    'Alemanha': 'de', 'Curaçao': 'cw', 'Costa do Marfim': 'ci', 'Equador': 'ec',
    'Holanda': 'nl', 'Japão': 'jp', 'Suécia': 'se', 'Tunísia': 'tn',
    'Bélgica': 'be', 'Egito': 'eg', 'Irão': 'ir', 'Nova Zelândia': 'nz',
    'Espanha': 'es', 'Cabo Verde': 'cv', 'Arábia Saudita': 'sa', 'Uruguai': 'uy',
    'França': 'fr', 'Senegal': 'sn', 'Iraque': 'iq', 'Noruega': 'no',
    'Argentina': 'ar', 'Argélia': 'dz', 'Áustria': 'at', 'Jordânia': 'jo',
    'Portugal': 'pt', 'RD Congo': 'cd', 'Uzbequistão': 'uz', 'Colômbia': 'co',
    'Inglaterra': 'gb-eng', 'Croácia': 'hr', 'Gana': 'gh', 'Panamá': 'pa'
  };
  
  if (map[str]) flag = map[str];
  
  const enMap = {
    'México': 'Mexico', 'África do Sul': 'South Africa', 'Coreia do Sul': 'South Korea', 'Tchéquia': 'Czechia',
    'Canadá': 'Canada', 'Bósnia e Herz.': 'Bosnia & Herz.', 'Catar': 'Qatar', 'Suíça': 'Switzerland',
    'Brasil': 'Brazil', 'Marrocos': 'Morocco', 'Haiti': 'Haiti', 'Escócia': 'Scotland',
    'Estados Unidos': 'United States', 'Paraguai': 'Paraguay', 'Austrália': 'Australia', 'Turquia': 'Turkey',
    'Alemanha': 'Germany', 'Curaçao': 'Curaçao', 'Costa do Marfim': 'Ivory Coast', 'Equador': 'Ecuador',
    'Holanda': 'Netherlands', 'Japão': 'Japan', 'Suécia': 'Sweden', 'Tunísia': 'Tunisia',
    'Bélgica': 'Belgium', 'Egito': 'Egypt', 'Irão': 'Iran', 'Nova Zelândia': 'New Zealand',
    'Espanha': 'Spain', 'Cabo Verde': 'Cape Verde', 'Arábia Saudita': 'Saudi Arabia', 'Uruguai': 'Uruguay',
    'França': 'France', 'Senegal': 'Senegal', 'Iraque': 'Iraq', 'Noruega': 'Norway',
    'Argentina': 'Argentina', 'Argélia': 'Algeria', 'Áustria': 'Austria', 'Jordânia': 'Jordan',
    'Portugal': 'Portugal', 'RD Congo': 'DR Congo', 'Uzbequistão': 'Uzbekistan', 'Colômbia': 'Colombia',
    'Inglaterra': 'England', 'Croácia': 'Croatia', 'Gana': 'Ghana', 'Panamá': 'Panama'
  };
  
  return { name: enMap[str] || str, flag: flag };
}

let i = 0;
while (i < raw.length) {
  let line = raw[i];
  if (!line || line.startsWith('Fase de grupos ·') || line === '16 avos de final' || line === 'Oitavas de final' || line === 'Quartas de final' || line === 'Semifinais' || line === 'Disputa pelo terceiro lugar' || line === 'Final' || line.startsWith('►')) {
    i++;
    continue;
  }
  
  let group = "";
  let phase = "";
  
  if (line.startsWith('Grupo ')) {
    group = line.replace('Grupo ', '').trim();
    phase = "groups";
    i++;
    line = raw[i];
  } else if (raw[i-1] === '16 avos de final' || raw[i-2] === '16 avos de final') {
    group = "Round of 32"; phase = "knockouts";
  } else if (raw[i-1] === 'Oitavas de final' || raw[i-2] === 'Oitavas de final') {
    group = "Round of 16"; phase = "knockouts";
  } else if (raw[i-1] === 'Quartas de final' || raw[i-2] === 'Quartas de final') {
    group = "Quarterfinals"; phase = "knockouts";
  } else if (raw[i-1] === 'Semifinais' || raw[i-2] === 'Semifinais') {
    group = "Semifinals"; phase = "knockouts";
  } else if (raw[i-1] === 'Disputa pelo terceiro lugar' || raw[i-2] === 'Disputa pelo terceiro lugar') {
    group = "Third Place"; phase = "knockouts";
  } else if (raw[i-1] === 'Final' || raw[i-2] === 'Final') {
    group = "Final"; phase = "knockouts";
  }
  
  // Sometimes date line has the group name as previous line, or it is the date.
  let dateStr = line;
  if (dateStr.includes(',')) {
    dateStr = dateStr.split(',')[1].trim(); // e.g. "Sábado, 13/06" -> "13/06"
  } else if (dateStr === 'Hoje') {
    dateStr = '11/06';
  } else if (dateStr === 'Amanhã') {
    dateStr = '12/06';
  }
  
  if (!dateStr.includes('/')) {
    // maybe it's not a date, let's just find the date
    i++;
    continue;
  }
  
  i++;
  let timeStr = raw[i];
  while (timeStr === "" || timeStr.startsWith('►') || timeStr === '16 avos de final' || timeStr.includes(' de final') || timeStr === 'Final' || timeStr === 'Disputa pelo terceiro lugar') {
    i++;
    timeStr = raw[i];
  }
  
  // Build date
  let [day, month] = dateStr.split('/');
  let [hours, minutes] = timeStr.split(':');
  
  // Date is in Portugal time (UTC+1). Let's convert to UTC ISO.
  // 2026-06-11T20:00:00+01:00 -> 2026-06-11T19:00:00Z
  // If month is 07, it's July.
  let dateObj = new Date(Date.UTC(2026, parseInt(month)-1, parseInt(day), parseInt(hours) - 1, parseInt(minutes), 0));
  
  i++;
  let homeStr = raw[i];
  while (homeStr !== undefined && (homeStr === "" || homeStr.startsWith('►'))) {
    i++;
    homeStr = raw[i];
  }
  if (!homeStr) homeStr = 'A determ.';
  
  i++;
  let awayStr = raw[i];
  while (awayStr !== undefined && (awayStr === "" || awayStr.startsWith('►'))) {
    i++;
    awayStr = raw[i];
  }
  if (!awayStr) awayStr = 'A determ.';
  
  let homeTeam = getCleanTeam(homeStr);
  let awayTeam = getCleanTeam(awayStr);
  
  if (phase === "groups" && groupTeams[group]) {
     if (!groupTeams[group].find(t => t.name === homeTeam.name)) groupTeams[group].push(homeTeam);
     if (!groupTeams[group].find(t => t.name === awayTeam.name)) groupTeams[group].push(awayTeam);
  }
  
  matches.push({
    id: matchId++,
    phase: phase,
    group: group,
    date: dateObj.toISOString(),
    homeTeam: homeTeam.name,
    homeFlag: homeTeam.flag,
    awayTeam: awayTeam.name,
    awayFlag: awayTeam.flag,
    homeScore: "",
    awayScore: ""
  });
  
  i++;
}

// Generate the final JS code
let jsCode = `export const groupTeams = ${JSON.stringify(groupTeams, null, 2)};\n\n`;
jsCode += `const matches = ${JSON.stringify(matches, null, 2)};\n\n`;
jsCode += `export default matches;\n`;

fs.writeFileSync('src/data/matches.js', jsCode);
console.log("Successfully generated src/data/matches.js with", matches.length, "matches!");
