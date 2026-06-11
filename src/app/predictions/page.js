"use client";

import { useState, useEffect } from "react";
import styles from "./predictions.module.css";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import allMatches from "@/data/matches";
import { campuses } from "@/data/campuses";

export default function Predictions() {
  const [games, setGames] = useState(allMatches);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [nickname, setNickname] = useState("");
  const [campus, setCampus] = useState("");
  const [isSavingNick, setIsSavingNick] = useState(false);
  const [activeTab, setActiveTab] = useState("groups");
  const router = useRouter();

  useEffect(() => {
    const fetchSessionAndData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Redirect if not logged in
        router.push('/login');
        return;
      }
      
      setUser(session.user);
      
      // Fetch predictions saved in the database
      const { data: predictions } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', session.user.id);
        
      // Fetch official scores
      const { data: officialScores } = await supabase
        .from('official_matches')
        .select('*');
        
      // Fetch knockout teams
      const { data: knockoutTeams } = await supabase
        .from('knockout_teams')
        .select('*');
        
      // Fetch nickname and campus if they exist
      const { data: profile } = await supabase
        .from('profiles')
        .select('nickname, campus')
        .eq('user_id', session.user.id)
        .single();
        
      if (profile) {
        setNickname(profile.nickname || "");
        setCampus(profile.campus || "");
      }
      
      // Update 'games' state with values from the database
      setGames(prevGames => prevGames.map(game => {
        const savedPrediction = predictions?.find(p => p.match_id === game.id);
        const savedOfficial = officialScores?.find(o => o.match_id === game.id);
        const savedKnockout = knockoutTeams?.find(k => k.match_id === game.id);
        
        let updatedGame = {
          ...game,
          homeScore: savedPrediction ? String(savedPrediction.home_score) : game.homeScore,
          awayScore: savedPrediction ? String(savedPrediction.away_score) : game.awayScore,
          officialHome: savedOfficial ? savedOfficial.home_score : undefined,
          officialAway: savedOfficial ? savedOfficial.away_score : undefined
        };
        
        if (savedKnockout) {
          updatedGame.homeTeam = savedKnockout.home_team;
          updatedGame.homeFlag = savedKnockout.home_flag;
          updatedGame.awayTeam = savedKnockout.away_team;
          updatedGame.awayFlag = savedKnockout.away_flag;
        }
        
        return updatedGame;
      }));

      setIsLoading(false);
    };

    fetchSessionAndData();
  }, [router]);

  const handleScoreChange = (id, team, value) => {
    // Only accepts up to 2 numeric digits
    if (value.length > 2) return;
    
    setGames(prevGames => prevGames.map(game => {
      if (game.id === id) {
        return { ...game, [team]: value };
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
      // If empty and minus is clicked, set to 0
      handleScoreChange(id, team, "0");
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    
    // Get all matches that have at least one side filled
    const partiallyOrFullyFilled = games.filter(g => g.homeScore !== "" || g.awayScore !== "");
    
    if (partiallyOrFullyFilled.length === 0) {
      alert("Please enter at least one prediction before saving.");
      setIsSaving(false);
      return;
    }

    // Build payload assuming "0" for empty fields if the other side is filled
    const payload = partiallyOrFullyFilled.map(g => {
      const hScore = g.homeScore === "" ? 0 : parseInt(g.homeScore);
      const aScore = g.awayScore === "" ? 0 : parseInt(g.awayScore);
      
      return {
        user_id: user.id,
        match_id: g.id,
        home_score: hScore,
        away_score: aScore,
        updated_at: new Date().toISOString()
      };
    });

    // Use upsert with onConflict based on unique constraint (user_id, match_id).
    // IMPORTANT: There should be no spaces in the 'user_id,match_id' string.
    const { error } = await supabase
      .from('predictions')
      .upsert(payload, { onConflict: 'user_id,match_id' });
      
    setIsSaving(false);
    
    if (error) {
      console.error("Upsert Error:", error);
      alert(`Error saving: ${error.message || 'Check the console'}`);
    } else {
      alert("Predictions saved successfully! Good luck!");
    }
  };

  const handleSaveProfile = async () => {
    if (!nickname.trim()) return;
    if (nickname.trim().length > 20) {
      alert("Nickname cannot exceed 20 characters.");
      return;
    }
    setIsSavingNick(true);
    
    const { error } = await supabase
      .from('profiles')
      .upsert({ user_id: user.id, nickname: nickname.trim(), campus: campus }, { onConflict: 'user_id' });
      
    setIsSavingNick(false);
    if (error) {
      console.error(error);
      alert("Error saving profile.");
    } else {
      alert("Profile updated successfully!");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const checkIsLocked = (isoString) => {
    const today = new Date();
    const matchDate = new Date(isoString);
    
    // Exact moment comparison
    return today >= matchDate;
  };

  // Convert UTC ISO string to the user's local timezone dynamically
  const formatDisplayDate = (isoString) => {
    const d = new Date(isoString);
    // Returns e.g. "Jun 11, 2026 - 13:00" if user is in Brazil (UTC-3)
    // or "Jun 11, 2026 - 17:00" if user is in UK/Portugal (UTC+1 depending on DST)
    const options = { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
    return d.toLocaleString('en-US', options).replace(',', ' -');
  }

  // Find the next upcoming match day to highlight
  const now = new Date();
  let nextMatchDateStr = null;
  const futureMatches = games.filter(g => new Date(g.date) > now);
  if (futureMatches.length > 0) {
    const sortedFuture = futureMatches.sort((a, b) => new Date(a.date) - new Date(b.date));
    const nextMatch = sortedFuture[0];
    nextMatchDateStr = new Date(nextMatch.date).toISOString().split('T')[0];
  }

  return (
    <main className={styles.container}>
      <Link href="/" style={{ color: "var(--text-muted)", marginBottom: "-20px" }}>
        &larr; Back to Home
      </Link>
      <header className={styles.header}>
        <h1 className={styles.title}>Predictions</h1>
        <p className={styles.subtitle}>Fill in your predictions and good luck!</p>
      </header>

      <section className={`glass-panel ${styles.nickBanner}`}>
        <div className={styles.nickRow}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
            <label style={{ color: "#fff", fontWeight: "bold", fontSize: '0.9rem' }}>Your Nickname:</label>
            <input 
              type="text" 
              className={styles.nickInput}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g., Prediction Master"
              maxLength={20}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
            <label style={{ color: "#fff", fontWeight: "bold", fontSize: '0.9rem' }}>Your Campus:</label>
            <select
              className={styles.campusSelect}
              value={campus}
              onChange={(e) => setCampus(e.target.value)}
            >
              <option value="">Select a campus (optional)</option>
              {campuses.map((cGroup, i) => (
                <optgroup key={i} label={cGroup.region}>
                  {cGroup.names.map((cName, j) => (
                    <option key={j} value={cName}>{cName}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
            <button 
              className={`btn-primary ${styles.nickBtn}`} 
              onClick={handleSaveProfile} 
              disabled={isSavingNick || !nickname.trim()}
              style={{ marginTop: '22px' }}
            >
              {isSavingNick ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>
      </section>

      <section className={`glass-panel ${styles.rulesBanner}`}>
        <h3>🏆 Scoring Rules</h3>
        <ul className={styles.rulesList}>
          <li><span className={styles.pointsBadge}>5 pts</span> <strong>Bullseye:</strong> Guessed the exact score (e.g., predicted 2-1, ended 2-1).</li>
          <li><span className={styles.pointsBadge}>3 pts</span> <strong>Winner + GD:</strong> Guessed the winner and the goal difference (e.g., predicted 2-0, ended 3-1).</li>
          <li><span className={styles.pointsBadge}>2 pts</span> <strong>Draw:</strong> Guessed a draw but missed the exact scores (e.g., predicted 1-1, ended 2-2).</li>
          <li><span className={styles.pointsBadge}>1 pt</span> <strong>Winner Only:</strong> Guessed the winner but missed the goal difference (e.g., predicted 1-0, ended 3-0).</li>
        </ul>
      </section>

      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tabBtn} ${activeTab === "groups" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("groups")}
        >
          Group Stage
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === "knockouts" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("knockouts")}
        >
          Knockouts
        </button>
      </div>

      <section className={styles.groupSection}>
        {activeTab === "groups" && ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"].map(group => (
          <div key={group} style={{ marginBottom: "32px" }}>
            <h2 className={styles.groupTitle}>Group {group}</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
              {games.filter(g => g.group === group && g.phase === "groups").map(game => {
                const isLocked = checkIsLocked(game.date);
                const isNextMatchDay = nextMatchDateStr && game.date.startsWith(nextMatchDateStr);
                
                return (
                  <div key={game.id} className={`glass-panel ${styles.matchCard} ${isNextMatchDay ? styles.highlightCard : ""}`}>
                    {isNextMatchDay && <div className={styles.highlightBadge}>🔥 Upcoming Matches</div>}
                    <span className={styles.matchDate} suppressHydrationWarning>{formatDisplayDate(game.date)}</span>
                    {isLocked && <span className={styles.lockedBadge}>Locked</span>}
                    
                    <div className={styles.teamsRow}>
                      <div className={styles.team}>
                        <img src={`https://flagcdn.com/w80/${game.homeFlag}.png`} alt={game.homeTeam} className={styles.flag} />
                        <span className={styles.teamName}>{game.homeTeam}</span>
                        
                        <div className={styles.scoreControl}>
                          <button 
                            className={styles.scoreBtn} 
                            onClick={() => decrementScore(game.id, 'homeScore', game.homeScore)}
                            disabled={isLocked || game.homeScore === "0"}
                          >
                            -
                          </button>
                          <input 
                            type="number" 
                            className={styles.scoreInput} 
                            min="0" 
                            max="99" 
                            value={game.homeScore}
                            onChange={(e) => handleScoreChange(game.id, 'homeScore', e.target.value)}
                            placeholder="0"
                            disabled={isLocked}
                          />
                          <button 
                            className={styles.scoreBtn} 
                            onClick={() => incrementScore(game.id, 'homeScore', game.homeScore)}
                            disabled={isLocked}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 16px' }}>
                        <span className={styles.vs}>VS</span>
                        {isLocked && game.officialHome !== undefined && (
                          <div style={{ background: 'var(--primary-color)', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '4px', whiteSpace: 'nowrap' }}>
                            Official: {game.officialHome} - {game.officialAway}
                          </div>
                        )}
                      </div>

                      <div className={styles.team}>
                        <img src={`https://flagcdn.com/w80/${game.awayFlag}.png`} alt={game.awayTeam} className={styles.flag} />
                        <span className={styles.teamName}>{game.awayTeam}</span>
                        
                        <div className={styles.scoreControl}>
                          <button 
                            className={styles.scoreBtn} 
                            onClick={() => decrementScore(game.id, 'awayScore', game.awayScore)}
                            disabled={isLocked || game.awayScore === "0"}
                          >
                            -
                          </button>
                          <input 
                            type="number" 
                            className={styles.scoreInput} 
                            min="0" 
                            max="99" 
                            value={game.awayScore}
                            onChange={(e) => handleScoreChange(game.id, 'awayScore', e.target.value)}
                            placeholder="0"
                            disabled={isLocked}
                          />
                          <button 
                            className={styles.scoreBtn} 
                            onClick={() => incrementScore(game.id, 'awayScore', game.awayScore)}
                            disabled={isLocked}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {activeTab === "knockouts" && ["Round of 32", "Round of 16", "Quarterfinals", "Semifinals", "Third Place", "Final"].map(phase => (
          <div key={phase} style={{ marginBottom: "32px" }}>
            <h2 className={styles.groupTitle}>{phase}</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
              {games.filter(g => g.group === phase && g.phase === "knockouts").map(game => {
                const isLocked = checkIsLocked(game.date);
                const isTBD = game.homeTeam === "TBD" || game.awayTeam === "TBD";
                const isNextMatchDay = nextMatchDateStr && game.date.startsWith(nextMatchDateStr);
                
                return (
                  <div key={game.id} className={`glass-panel ${styles.matchCard} ${isNextMatchDay ? styles.highlightCard : ""}`}>
                    {isNextMatchDay && <div className={styles.highlightBadge}>🔥 Upcoming Matches</div>}
                    <span className={styles.matchDate} suppressHydrationWarning>{formatDisplayDate(game.date)}</span>
                    {isLocked && <span className={styles.lockedBadge}>Locked</span>}
                    {isTBD && <span className={styles.lockedBadge} style={{ background: "rgba(255, 165, 0, 0.2)", color: "#FFA500" }}>Waiting for Teams</span>}
                    
                    <div className={styles.teamsRow} style={{ opacity: isTBD ? 0.6 : 1 }}>
                      <div className={styles.team}>
                        {game.homeFlag !== "un" && <img src={`https://flagcdn.com/w80/${game.homeFlag}.png`} alt={game.homeTeam} className={styles.flag} />}
                        <span className={styles.teamName}>{game.homeTeam}</span>
                        
                        <div className={styles.scoreControl}>
                          <button 
                            className={styles.scoreBtn} 
                            onClick={() => decrementScore(game.id, 'homeScore', game.homeScore)}
                            disabled={isLocked || isTBD || game.homeScore === "0"}
                          >
                            -
                          </button>
                          <input 
                            type="number" 
                            className={styles.scoreInput} 
                            min="0" 
                            max="99" 
                            value={game.homeScore}
                            onChange={(e) => handleScoreChange(game.id, 'homeScore', e.target.value)}
                            placeholder="0"
                            disabled={isLocked || isTBD}
                          />
                          <button 
                            className={styles.scoreBtn} 
                            onClick={() => incrementScore(game.id, 'homeScore', game.homeScore)}
                            disabled={isLocked || isTBD}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 16px' }}>
                        <span className={styles.vs}>VS</span>
                        {isLocked && game.officialHome !== undefined && (
                          <div style={{ background: 'var(--primary-color)', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '4px', whiteSpace: 'nowrap' }}>
                            Official: {game.officialHome} - {game.officialAway}
                          </div>
                        )}
                      </div>

                      <div className={styles.team}>
                        {game.awayFlag !== "un" && <img src={`https://flagcdn.com/w80/${game.awayFlag}.png`} alt={game.awayTeam} className={styles.flag} />}
                        <span className={styles.teamName}>{game.awayTeam}</span>

                        <div className={styles.scoreControl}>
                          <button 
                            className={styles.scoreBtn} 
                            onClick={() => decrementScore(game.id, 'awayScore', game.awayScore)}
                            disabled={isLocked || isTBD || game.awayScore === "0"}
                          >
                            -
                          </button>
                          <input 
                            type="number" 
                            className={styles.scoreInput} 
                            min="0" 
                            max="99" 
                            value={game.awayScore}
                            onChange={(e) => handleScoreChange(game.id, 'awayScore', e.target.value)}
                            placeholder="0"
                            disabled={isLocked || isTBD}
                          />
                          <button 
                            className={styles.scoreBtn} 
                            onClick={() => incrementScore(game.id, 'awayScore', game.awayScore)}
                            disabled={isLocked || isTBD}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className={styles.actionRow} style={{ marginTop: "24px" }}>
          <button className="btn-primary" onClick={handleSave} style={{ width: "100%", fontSize: "1.1rem" }} disabled={isSaving || isLoading}>
            {isLoading ? "Loading..." : isSaving ? "Saving predictions..." : "Save All Predictions"}
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
      </section>
    </main>
  );
}
