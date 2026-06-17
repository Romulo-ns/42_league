"use client";

import { useState, useEffect } from "react";
import styles from "./results.module.css";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import allMatches from "@/data/matches";

export default function Results() {
  const [lockedGames, setLockedGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      // Find matches that have already kicked off (locked)
      const now = new Date();
      let pastMatches = allMatches.filter(g => new Date(g.date) <= now);

      // Sort by date descending (most recent first)
      pastMatches.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Fetch official scores saved in the database
      const { data: officialScores, error } = await supabase
        .from('official_matches')
        .select('*');

      // Fetch knockout teams
      const { data: knockoutTeams } = await supabase
        .from('knockout_teams')
        .select('*');

      if (!error) {
        pastMatches = pastMatches.map(game => {
          const savedScore = officialScores?.find(p => p.match_id === game.id);
          const savedKnockout = knockoutTeams?.find(k => k.match_id === game.id);

          let updatedGame = { ...game };

          if (savedScore) {
            updatedGame.officialHome = savedScore.home_score;
            updatedGame.officialAway = savedScore.away_score;
          }

          if (savedKnockout) {
            updatedGame.homeTeam = savedKnockout.home_team;
            updatedGame.homeFlag = savedKnockout.home_flag;
            updatedGame.awayTeam = savedKnockout.away_team;
            updatedGame.awayFlag = savedKnockout.away_flag;
          }

          return updatedGame;
        });
      }

      setLockedGames(pastMatches);
      setIsLoading(false);
    };

    fetchResults();
  }, []);

  const formatDisplayDate = (isoString) => {
    const d = new Date(isoString);
    const options = { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
    return d.toLocaleString('en-US', options).replace(',', ' -');
  };

  if (isLoading) {
    return <main className={styles.container}><div style={{ textAlign: 'center', marginTop: '50px' }}>Loading Official Results...</div></main>;
  }

  return (
    <main className={styles.container}>
      <Link href="/" style={{ color: "var(--text-muted)", marginBottom: "20px", display: "inline-block" }}>
        &larr; Back to Home
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>Official Results</h1>
        <p className={styles.subtitle}>Final scores for matches that have already kicked off.</p>
      </header>

      {lockedGames.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: "40px" }}>
          <h3 style={{ color: "#fff" }}>No matches have started yet!</h3>
          <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>Check back later once the tournament kicks off.</p>
        </div>
      ) : (
        <section className={styles.matchList}>
          {lockedGames.map(game => {
            const hasOfficialScore = game.officialHome !== undefined && game.officialAway !== undefined;

            return (
              <div key={game.id} className={`glass-panel ${styles.matchCard}`}>
                <span className={styles.matchDate} suppressHydrationWarning>
                  {formatDisplayDate(game.date)} | {game.phase === 'groups' ? `Group ${game.group}` : game.group}
                </span>

                <div className={styles.teamsRow}>
                  <div className={styles.team}>
                    {game.homeFlag !== "un" && <img src={`https://flagcdn.com/w80/${game.homeFlag}.png`} alt={game.homeTeam} className={styles.flag} />}
                    <span className={styles.teamName}>{game.homeTeam}</span>
                  </div>

                  <div className={styles.centerColumn}>
                    {hasOfficialScore ? (
                      <div className={styles.scoreBadge}>
                        {game.officialHome} - {game.officialAway}
                      </div>
                    ) : (
                      <div className={styles.pendingBadge}>
                        Pending Result
                      </div>
                    )}
                  </div>

                  <div className={styles.team}>
                    {game.awayFlag !== "un" && <img src={`https://flagcdn.com/w80/${game.awayFlag}.png`} alt={game.awayTeam} className={styles.flag} />}
                    <span className={styles.teamName}>{game.awayTeam}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </main>
  );
}
