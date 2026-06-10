"use client";

import { useState, useEffect } from "react";
import styles from "./jogos.module.css";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Jogos() {
  // Using ISO 8601 Strings with "Z" to denote UTC time. 
  // This guarantees the match locks at the exact same moment globally.
  const initialGames = [
    { id: 1, date: "2026-06-11T16:00:00Z", group: "A", homeTeam: "Mexico", homeFlag: "mx", awayTeam: "South Africa", awayFlag: "za", homeScore: "", awayScore: "" },
    { id: 2, date: "2026-06-11T20:00:00Z", group: "A", homeTeam: "South Korea", homeFlag: "kr", awayTeam: "Czechia", awayFlag: "cz", homeScore: "", awayScore: "" },
    { id: 3, date: "2026-06-12T15:00:00Z", group: "B", homeTeam: "Canada", homeFlag: "ca", awayTeam: "Switzerland", awayFlag: "ch", homeScore: "", awayScore: "" },
    { id: 4, date: "2026-06-12T19:00:00Z", group: "B", homeTeam: "Qatar", homeFlag: "qa", awayTeam: "Bosnia & Herz.", awayFlag: "ba", homeScore: "", awayScore: "" },
    { id: 5, date: "2026-06-13T16:00:00Z", group: "C", homeTeam: "Brazil", homeFlag: "br", awayTeam: "Morocco", awayFlag: "ma", homeScore: "", awayScore: "" },
    { id: 6, date: "2026-06-13T20:00:00Z", group: "C", homeTeam: "Haiti", homeFlag: "ht", awayTeam: "Scotland", awayFlag: "gb-sct", homeScore: "", awayScore: "" },
    { id: 7, date: "2026-06-14T16:00:00Z", group: "D", homeTeam: "USA", homeFlag: "us", awayTeam: "Paraguay", awayFlag: "py", homeScore: "", awayScore: "" },
    { id: 8, date: "2026-06-14T20:00:00Z", group: "D", homeTeam: "Australia", homeFlag: "au", awayTeam: "Türkiye", awayFlag: "tr", homeScore: "", awayScore: "" },
    { id: 9, date: "2026-06-15T15:00:00Z", group: "E", homeTeam: "Germany", homeFlag: "de", awayTeam: "Curaçao", awayFlag: "cw", homeScore: "", awayScore: "" },
    { id: 10, date: "2026-06-15T19:00:00Z", group: "E", homeTeam: "Ivory Coast", homeFlag: "ci", awayTeam: "Ecuador", awayFlag: "ec", homeScore: "", awayScore: "" },
    { id: 11, date: "2026-06-16T16:00:00Z", group: "F", homeTeam: "Netherlands", homeFlag: "nl", awayTeam: "Japan", awayFlag: "jp", homeScore: "", awayScore: "" },
    { id: 12, date: "2026-06-16T20:00:00Z", group: "F", homeTeam: "Tunisia", homeFlag: "tn", awayTeam: "Sweden", awayFlag: "se", homeScore: "", awayScore: "" },
    { id: 13, date: "2026-06-17T15:00:00Z", group: "G", homeTeam: "Belgium", homeFlag: "be", awayTeam: "Egypt", awayFlag: "eg", homeScore: "", awayScore: "" },
    { id: 14, date: "2026-06-17T19:00:00Z", group: "G", homeTeam: "Iran", homeFlag: "ir", awayTeam: "New Zealand", awayFlag: "nz", homeScore: "", awayScore: "" },
    { id: 15, date: "2026-06-18T16:00:00Z", group: "H", homeTeam: "Spain", homeFlag: "es", awayTeam: "Cape Verde", awayFlag: "cv", homeScore: "", awayScore: "" },
    { id: 16, date: "2026-06-18T20:00:00Z", group: "H", homeTeam: "Saudi Arabia", homeFlag: "sa", awayTeam: "Uruguay", awayFlag: "uy", homeScore: "", awayScore: "" },
    { id: 17, date: "2026-06-19T15:00:00Z", group: "I", homeTeam: "France", homeFlag: "fr", awayTeam: "Senegal", awayFlag: "sn", homeScore: "", awayScore: "" },
    { id: 18, date: "2026-06-19T19:00:00Z", group: "I", homeTeam: "Norway", homeFlag: "no", awayTeam: "Iraq", awayFlag: "iq", homeScore: "", awayScore: "" },
    { id: 19, date: "2026-06-20T16:00:00Z", group: "J", homeTeam: "Argentina", homeFlag: "ar", awayTeam: "Algeria", awayFlag: "dz", homeScore: "", awayScore: "" },
    { id: 20, date: "2026-06-20T20:00:00Z", group: "J", homeTeam: "Austria", homeFlag: "at", awayTeam: "Jordan", awayFlag: "jo", homeScore: "", awayScore: "" },
    { id: 21, date: "2026-06-21T15:00:00Z", group: "K", homeTeam: "Portugal", homeFlag: "pt", awayTeam: "Uzbekistan", awayFlag: "uz", homeScore: "", awayScore: "" },
    { id: 22, date: "2026-06-21T19:00:00Z", group: "K", homeTeam: "Colombia", homeFlag: "co", awayTeam: "DR Congo", awayFlag: "cd", homeScore: "", awayScore: "" },
    { id: 23, date: "2026-06-22T16:00:00Z", group: "L", homeTeam: "England", homeFlag: "gb-eng", awayTeam: "Croatia", awayFlag: "hr", homeScore: "", awayScore: "" },
    { id: 24, date: "2026-06-22T20:00:00Z", group: "L", homeTeam: "Ghana", homeFlag: "gh", awayTeam: "Panama", awayFlag: "pa", homeScore: "", awayScore: "" },
  ];

  const [games, setGames] = useState(initialGames);
  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSessionAndData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Redireciona se não estiver logado
        router.push('/login');
        return;
      }
      
      setUser(session.user);
      
      // Busca os palpites salvos no banco
      const { data: predictions, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', session.user.id);
        
      if (!error && predictions && predictions.length > 0) {
        // Atualiza o state 'games' com os valores vindos do banco
        setGames(prevGames => prevGames.map(game => {
          const savedPrediction = predictions.find(p => p.match_id === game.id);
          if (savedPrediction) {
            return {
              ...game,
              homeScore: String(savedPrediction.home_score),
              awayScore: String(savedPrediction.away_score)
            };
          }
          return game;
        }));
      }
      setIsLoading(false);
    };

    fetchSessionAndData();
  }, [router]);

  const handleScoreChange = (id, team, value) => {
    // Só aceita até 2 digitos numéricos
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
      // Se tiver vazio e apertar menos, vira 0
      handleScoreChange(id, team, "0");
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    
    // Pega todos os jogos que têm pelo menos um lado preenchido
    const partiallyOrFullyFilled = games.filter(g => g.homeScore !== "" || g.awayScore !== "");
    
    if (partiallyOrFullyFilled.length === 0) {
      alert("Por favor, preencha pelo menos um palpite antes de salvar.");
      setIsSaving(false);
      return;
    }

    // Monta o payload assumindo "0" para campos vazios caso o outro lado esteja preenchido
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

    // Usa o upsert com onConflict baseado na restrição única (user_id, match_id).
    // IMPORTANTE: Não deve haver espaços na string 'user_id,match_id'.
    const { error } = await supabase
      .from('predictions')
      .upsert(payload, { onConflict: 'user_id,match_id' });
      
    setIsSaving(false);
    
    if (error) {
      console.error("Upsert Error:", error);
      alert(`Erro ao salvar: ${error.message || 'Verifique o console'}`);
    } else {
      alert("Palpites salvos com sucesso! Boa sorte!");
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

  return (
    <main className={styles.container}>
      <Link href="/" style={{ color: "var(--text-muted)", marginBottom: "-20px" }}>
        &larr; Back to Home
      </Link>

      <div className={styles.header}>
        <h1 className="text-gradient">Group Stage</h1>
        <p style={{ color: "var(--text-muted)" }}>Predict the exact scores before the match starts!</p>
      </div>

      <section className={`${styles.rulesSection} glass-panel`}>
        <h2>Scoring Rules</h2>
        <table className={styles.rulesTable}>
          <thead>
            <tr>
              <th>Achievement</th>
              <th style={{ textAlign: "right" }}>Points</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Correct Winner / Draw</td>
              <td style={{ textAlign: "right" }}><span className={styles.pointsBadge}>3 pts</span></td>
            </tr>
            <tr>
              <td>Correct Goal Difference</td>
              <td style={{ textAlign: "right" }}><span className={styles.pointsBadge}>5 pts</span></td>
            </tr>
            <tr>
              <td>Exact Score</td>
              <td style={{ textAlign: "right" }}><span className={styles.pointsBadge}>10 pts</span></td>
            </tr>
            <tr>
              <td>Correct Group Qualifier</td>
              <td style={{ textAlign: "right" }}><span className={styles.pointsBadge}>15 pts</span></td>
            </tr>
            <tr>
              <td>Correct Semifinalist</td>
              <td style={{ textAlign: "right" }}><span className={styles.pointsBadge}>20 pts</span></td>
            </tr>
            <tr>
              <td>Correct Finalist</td>
              <td style={{ textAlign: "right" }}><span className={styles.pointsBadge}>30 pts</span></td>
            </tr>
            <tr>
              <td>Correct Champion</td>
              <td style={{ textAlign: "right" }}><span className={styles.pointsBadge}>50 pts</span></td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className={styles.groupSection}>
        {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"].map(group => (
          <div key={group} style={{ marginBottom: "32px" }}>
            <h2 className={styles.groupTitle}>Group {group}</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
              {games.filter(g => g.group === group).map(game => {
                const isLocked = checkIsLocked(game.date);
                
                return (
                  <div key={game.id} className={`glass-panel ${styles.matchCard}`}>
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
                      
                      <span className={styles.vs}>X</span>

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

        <div className={styles.actionRow} style={{ marginTop: "24px" }}>
          <button className="btn-primary" onClick={handleSave} style={{ width: "100%", fontSize: "1.1rem" }} disabled={isSaving || isLoading}>
            {isLoading ? "Carregando..." : isSaving ? "Salvando Palpites..." : "Save All Predictions"}
          </button>
        </div>

        <div className={styles.scrollButtons}>
          <button className={styles.scrollBtn} onClick={scrollToTop} aria-label="Scroll to top" title="Ir para o topo">
            ↑
          </button>
          <button className={styles.scrollBtn} onClick={scrollToBottom} aria-label="Scroll to bottom" title="Ir para o final">
            ↓
          </button>
        </div>
      </section>
    </main>
  );
}
