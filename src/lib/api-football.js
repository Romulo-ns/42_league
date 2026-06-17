export async function fetchFixturesByDate(dateString) {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    throw new Error('API_FOOTBALL_KEY is not set');
  }

  const url = `https://v3.football.api-sports.io/fixtures?date=${dateString}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-apisports-key': apiKey,
      'x-apisports-host': 'v3.football.api-sports.io'
    },
    // Adding cache option so we don't spam the API within the same minute
    next: { revalidate: 60 } 
  });

  if (!response.ok) {
    throw new Error(`API Football error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.errors && Object.keys(data.errors).length > 0) {
    console.error("API Football returned errors:", data.errors);
    throw new Error('API Football returned errors');
  }

  return data.response;
}

export function normalizeTeamName(name) {
  if (!name) return "";
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .toLowerCase()
    .replace(/[^a-z]/g, ""); // Keep only letters for flexible matching
}
