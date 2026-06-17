import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import allMatches from '@/data/matches';
import { fetchFixturesByDate, normalizeTeamName } from '@/lib/api-football';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Basic security to ensure only cron or admin hits this
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // In a real app we would reject, but let's allow it for testing if CRON_SECRET is not set
      if (process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const now = new Date();
    const matchesToUpdate = [];
    const uniqueDates = new Set();

    // Find matches that started within the last 4 hours
    allMatches.forEach(match => {
      const matchDate = new Date(match.date);
      const diffHours = (now - matchDate) / (1000 * 60 * 60);

      // if the game started between 0 and 4 hours ago, we should update it
      // this perfectly covers the 1hr, 2hr, 3hr requirement
      if (diffHours >= 0 && diffHours <= 4) {
        matchesToUpdate.push(match);
        // Extract YYYY-MM-DD in UTC
        const dateStr = matchDate.toISOString().split('T')[0];
        uniqueDates.add(dateStr);
      }
    });

    if (matchesToUpdate.length === 0) {
      return NextResponse.json({ message: 'No matches currently active to sync.' });
    }

    let allFetchedFixtures = [];

    for (const dateStr of uniqueDates) {
      const fixtures = await fetchFixturesByDate(dateStr);
      allFetchedFixtures = allFetchedFixtures.concat(fixtures);
    }

    const upsertPayload = [];

    matchesToUpdate.forEach(localMatch => {
      const localHome = normalizeTeamName(localMatch.homeTeam);
      const localAway = normalizeTeamName(localMatch.awayTeam);

      // Find the corresponding fixture from API-Football
      const apiFixture = allFetchedFixtures.find(f => {
        const apiHome = normalizeTeamName(f.teams.home.name);
        const apiAway = normalizeTeamName(f.teams.away.name);
        
        return localHome === apiHome && localAway === apiAway;
      });

      if (apiFixture) {
        // Match found! Get the scores.
        const homeScore = apiFixture.goals.home;
        const awayScore = apiFixture.goals.away;

        if (homeScore !== null && awayScore !== null) {
          upsertPayload.push({
            match_id: localMatch.id,
            home_score: homeScore,
            away_score: awayScore
          });
        }
      }
    });

    if (upsertPayload.length > 0) {
      const { error } = await supabase
        .from('official_matches')
        .upsert(upsertPayload, { onConflict: 'match_id' });

      if (error) {
        console.error("Supabase upsert error:", error);
        return NextResponse.json({ error: 'Failed to save to database' }, { status: 500 });
      }

      return NextResponse.json({ 
        message: `Successfully synced ${upsertPayload.length} match(es).`,
        synced: upsertPayload
      });
    }

    return NextResponse.json({ message: 'Matches found but no scores available yet or team names did not match.' });

  } catch (err) {
    console.error("Cron sync error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
