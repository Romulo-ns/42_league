export const groupTeams = {
  A: [{name: "Mexico", flag: "mx"}, {name: "South Africa", flag: "za"}, {name: "South Korea", flag: "kr"}, {name: "Czechia", flag: "cz"}],
  B: [{name: "Canada", flag: "ca"}, {name: "Bosnia & Herz.", flag: "ba"}, {name: "Qatar", flag: "qa"}, {name: "Switzerland", flag: "ch"}],
  C: [{name: "Brazil", flag: "br"}, {name: "Morocco", flag: "ma"}, {name: "Haiti", flag: "ht"}, {name: "Scotland", flag: "gb-sct"}],
  D: [{name: "USA", flag: "us"}, {name: "Paraguay", flag: "py"}, {name: "Australia", flag: "au"}, {name: "Türkiye", flag: "tr"}],
  E: [{name: "Germany", flag: "de"}, {name: "Curaçao", flag: "cw"}, {name: "Ivory Coast", flag: "ci"}, {name: "Ecuador", flag: "ec"}],
  F: [{name: "Netherlands", flag: "nl"}, {name: "Japan", flag: "jp"}, {name: "Sweden", flag: "se"}, {name: "Tunisia", flag: "tn"}],
  G: [{name: "Belgium", flag: "be"}, {name: "Egypt", flag: "eg"}, {name: "Iran", flag: "ir"}, {name: "New Zealand", flag: "nz"}],
  H: [{name: "Spain", flag: "es"}, {name: "Cape Verde", flag: "cv"}, {name: "Saudi Arabia", flag: "sa"}, {name: "Uruguay", flag: "uy"}],
  I: [{name: "France", flag: "fr"}, {name: "Senegal", flag: "sn"}, {name: "Bolivia", flag: "bo"}, {name: "Norway", flag: "no"}],
  J: [{name: "Argentina", flag: "ar"}, {name: "Algeria", flag: "dz"}, {name: "Austria", flag: "at"}, {name: "Jordan", flag: "jo"}],
  K: [{name: "Portugal", flag: "pt"}, {name: "DR Congo", flag: "cd"}, {name: "Uzbekistan", flag: "uz"}, {name: "Colombia", flag: "co"}],
  L: [{name: "England", flag: "gb-eng"}, {name: "Croatia", flag: "hr"}, {name: "Ghana", flag: "gh"}, {name: "Panama", flag: "pa"}],
};

let matchId = 1;
// Fixed UTC time base for deterministic dates
const baseTime = 1781193600000; // 2026-06-11T16:00:00Z
const matches = [];

// Group Stage (72 matches)
for (let round = 0; round < 3; round++) {
  Object.keys(groupTeams).forEach(group => {
    const teams = groupTeams[group];
    let matchups;
    if (round === 0) matchups = [[0, 1], [2, 3]];
    if (round === 1) matchups = [[0, 2], [1, 3]];
    if (round === 2) matchups = [[0, 3], [1, 2]];
    
    matchups.forEach(m => {
       matches.push({
         id: matchId,
         phase: "groups",
         group: group,
         date: new Date(baseTime + (matchId * 1000 * 60 * 60 * 4)).toISOString(),
         homeTeam: teams[m[0]].name,
         homeFlag: teams[m[0]].flag,
         awayTeam: teams[m[1]].name,
         awayFlag: teams[m[1]].flag,
         homeScore: "",
         awayScore: ""
       });
       matchId++;
    });
  });
}

// Knockouts (32 matches)
const knockouts = [
  { group: "Round of 32", count: 16 },
  { group: "Round of 16", count: 8 },
  { group: "Quarterfinals", count: 4 },
  { group: "Semifinals", count: 2 },
  { group: "Third Place", count: 1 },
  { group: "Final", count: 1 }
];

knockouts.forEach(k => {
  for (let i = 0; i < k.count; i++) {
    matches.push({
       id: matchId,
       phase: "knockouts",
       group: k.group,
       date: new Date(baseTime + (matchId * 1000 * 60 * 60 * 8)).toISOString(),
       homeTeam: "TBD",
       homeFlag: "un", // Use UN flag or handled by CSS
       awayTeam: "TBD",
       awayFlag: "un",
       homeScore: "",
       awayScore: ""
    });
    matchId++;
  }
});

export default matches;
