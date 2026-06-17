"use client";

import { useState, useEffect } from "react";
import styles from "./admin.module.css";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import allMatches, { groupTeams } from "@/data/matches";

const allCountries = Object.values(groupTeams)
  .flat()
  .sort((a, b) => a.name.localeCompare(b.name));

const teamOptions = [{ name: "TBD", flag: "un" }, ...allCountries];

export default function AdminPanel() {
  const [games, setGames] = useState(allMatches);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      if (session.user.email !== adminEmail) {
        alert("Access Denied. You are not an administrator.");
        router.push('/');
        return;
      }

      setUser(session.user);

      // Fetch official scores saved in the database
      const { data: officialScores, error } = await supabase
        .from('official_matches')
        .select('*');

      // Fetch knockout teams (ignore error if table doesn't exist yet)
      const { data: knockoutTeams } = await supabase
        .from('knockout_teams')
        .select('*');

      if (!error) {
        setGames(prevGames => prevGames.map(game => {
          const savedScore = officialScores?.find(p => p.match_id === game.id);
          const savedKnockout = knockoutTeams?.find(k => k.match_id === game.id);

          let updatedGame = { ...game };

          if (savedScore) {
            updatedGame.homeScore = String(savedScore.home_score);
            updatedGame.awayScore = String(savedScore.away_score);
          }

          if (savedKnockout) {
            updatedGame.homeTeam = savedKnockout.home_team;
            updatedGame.homeFlag = savedKnockout.home_flag;
            updatedGame.awayTeam = savedKnockout.away_team;
            updatedGame.awayFlag = savedKnockout.away_flag;
          }

          return updatedGame;
        }));
      }
      setIsLoading(false);
    };

    checkAdminAndFetchData();
  }, [router]);

  const handleScoreChange = (id, team, value) => {
    if (value.length > 2) return;
    setGames(prevGames => prevGames.map(game => {
      if (game.id === id) {
        return { ...game, [team]: value };
      }
      return game;
    }));
  };

  const handleTeamChange = (id, side, teamName) => {
    const selectedTeam = teamOptions.find(t => t.name === teamName);
    if (!selectedTeam) return;

    setGames(prevGames => prevGames.map(game => {
      if (game.id === id) {
        return {
          ...game,
          [side + 'Team']: selectedTeam.name,
          [side + 'Flag']: selectedTeam.flag
        };
      }
      return game;
    }));
  };

  const incrementScore = (id, team, currentValue) => {
    const current = parseInt(currentValue) || 0;
    if (current < 99) {
      handleScoreChange(id, team, String(current + 1));
    }
  };

  const decrementScore = (id, team, currentValue) => {
    const current = parseInt(currentValue) || 0;
    if (current > 0) {
      handleScoreChange(id, team, String(current - 1));
    } else if (currentValue === "") {
      handleScoreChange(id, team, "0");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    // Get all matches that have both sides filled
    const fullyFilled = games.filter(g => g.homeScore !== "" && g.awayScore !== "");

    if (fullyFilled.length === 0) {
      alert("Please enter both scores for at least one match before saving.");
      setIsSaving(false);
      return;
    }

    const payload = fullyFilled.map(g => ({
      match_id: g.id,
      home_score: parseInt(g.homeScore),
      away_score: parseInt(g.awayScore)
    }));

    // Upsert official scores
    const { error } = await supabase
      .from('official_matches')
      .upsert(payload, { onConflict: 'match_id' });

    // Upsert knockout teams
    const knockoutPayload = games
      .filter(g => g.phase === 'knockouts' && (g.homeTeam !== 'TBD' || g.awayTeam !== 'TBD'))
      .map(g => ({
        match_id: g.id,
        home_team: g.homeTeam,
        home_flag: g.homeFlag,
        away_team: g.awayTeam,
        away_flag: g.awayFlag
      }));

    if (knockoutPayload.length > 0) {
      const { error: ktError } = await supabase
        .from('knockout_teams')
        .upsert(knockoutPayload, { onConflict: 'match_id' });

      if (ktError) {
        console.error("Knockout Teams Upsert Error:", ktError);
        alert(`Error saving knockout teams: ${ktError.message}`);
        setIsSaving(false);
        return;
      }
    }

    setIsSaving(false);

    if (error) {
      console.error("Upsert Error:", error);
      alert(`Error saving official scores: ${error.message}`);
    } else {
      alert("Changes saved successfully! The leaderboard will now update.");
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch('/api/cron/sync-matches', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to sync matches');
      } else {
        alert(data.message || 'Sync complete.');
        window.location.reload(); // Reload to fetch fresh data from Supabase
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setIsSyncing(false);
  };

  const formatDisplayDate = (isoString) => {
    const d = new Date(isoString);
    const options = { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
    return d.toLocaleString('en-US', options).replace(',', ' -');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  if (isLoading) {
    return <main className={styles.container}><div style={{ textAlign: 'center', marginTop: '50px' }}>Loading Admin Panel...</div></main>;
  }

  return (
    <main className={styles.container}>
      <Link href="/" style={{ color: "var(--text-muted)", marginBottom: "20px", display: "inline-block" }}>
        &larr; Back to Home
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>Admin Panel</h1>
        <p className={styles.subtitle}>Enter the official match results here.</p>
      </header>

      <section className={styles.matchList}>
        {games.map(game => (
          <div key={game.id} className={`glass-panel ${styles.matchCard}`}>
            <span className={styles.matchDate} suppressHydrationWarning>
              Match ID: {game.id} | {formatDisplayDate(game.date)} | {game.phase === 'groups' ? `Group ${game.group}` : game.group}
            </span>

            <div className={styles.teamsRow}>
              <div className={styles.team}>
                {game.homeFlag !== "un" && <img src={`https://flagcdn.com/w80/${game.homeFlag}.png`} alt={game.homeTeam} className={styles.flag} />}

                {game.phase === 'knockouts' ? (
                  <select
                    value={game.homeTeam}
                    onChange={(e) => handleTeamChange(game.id, 'home', e.target.value)}
                    style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid var(--card-border)', borderRadius: '4px', padding: '4px 8px', width: '100%' }}
                  >
                    {teamOptions.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                  </select>
                ) : (
                  <span className={styles.teamName}>{game.homeTeam}</span>
                )}

                <div className={styles.scoreControl}>
                  <button
                    className={styles.scoreBtn}
                    onClick={() => decrementScore(game.id, 'homeScore', game.homeScore)}
                    disabled={game.homeScore === "0"}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className={styles.scoreInput}
                    min="0" max="99"
                    value={game.homeScore}
                    onChange={(e) => handleScoreChange(game.id, 'homeScore', e.target.value)}
                    placeholder="-"
                  />
                  <button
                    className={styles.scoreBtn}
                    onClick={() => incrementScore(game.id, 'homeScore', game.homeScore)}
                  >
                    +
                  </button>
                </div>
              </div>

              <span className={styles.vs}>VS</span>

              <div className={styles.team}>
                {game.awayFlag !== "un" && <img src={`https://flagcdn.com/w80/${game.awayFlag}.png`} alt={game.awayTeam} className={styles.flag} />}

                {game.phase === 'knockouts' ? (
                  <select
                    value={game.awayTeam}
                    onChange={(e) => handleTeamChange(game.id, 'away', e.target.value)}
                    style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid var(--card-border)', borderRadius: '4px', padding: '4px 8px', width: '100%' }}
                  >
                    {teamOptions.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                  </select>
                ) : (
                  <span className={styles.teamName}>{game.awayTeam}</span>
                )}

                <div className={styles.scoreControl}>
                  <button
                    className={styles.scoreBtn}
                    onClick={() => decrementScore(game.id, 'awayScore', game.awayScore)}
                    disabled={game.awayScore === "0"}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className={styles.scoreInput}
                    min="0" max="99"
                    value={game.awayScore}
                    onChange={(e) => handleScoreChange(game.id, 'awayScore', e.target.value)}
                    placeholder="-"
                  />
                  <button
                    className={styles.scoreBtn}
                    onClick={() => incrementScore(game.id, 'awayScore', game.awayScore)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className={styles.actionRow} style={{ marginTop: "32px", marginBottom: "64px", display: "flex", gap: "16px", justifyContent: "center" }}>
        <button className={`btn-primary ${styles.saveBtn}`} onClick={handleSave} disabled={isSaving || isSyncing}>
          {isSaving ? "Saving..." : "Save Official Scores"}
        </button>
        <button
          className={`btn-primary ${styles.saveBtn}`}
          onClick={handleSync}
          disabled={isSyncing || isSaving}
        >
          {isSyncing ? "Syncing..." : "Sync API-Football"}
        </button>
      </div>

      <div className={styles.scrollButtons}>
        <button className={styles.scrollBtn} onClick={scrollToTop} aria-label="Scroll to top" title="Scroll to top">
          ↑
        </button>
        <button className={styles.scrollBtn} onClick={scrollToBottom} aria-label="Scroll to bottom" title="Scroll to bottom">
          ↓
        </button>
      </div>
    </main>
  );
}
