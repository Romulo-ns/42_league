"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./home.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import allMatches from "@/data/matches";

export default function Home() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [upcomingGames, setUpcomingGames] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    const fetchTopPlayers = async () => {
      const { data } = await supabase
        .from('user_scores')
        .select('*')
        .order('total_points', { ascending: false })
        .order('user_name', { ascending: true })
        .limit(3);
        
      if (data) {
        setLeaderboard(data);
      }
    };
    const fetchMatchesData = async () => {
      const now = new Date();
      let futureMatches = allMatches.filter(g => new Date(g.date) > now);
      if (futureMatches.length === 0) return;
      
      futureMatches.sort((a, b) => new Date(a.date) - new Date(b.date));
      const nextMatchDateStr = new Date(futureMatches[0].date).toISOString().split('T')[0];
      
      let upcoming = allMatches.filter(g => g.date.startsWith(nextMatchDateStr) && new Date(g.date) > now);
      
      // Fetch knockout teams to update any TBDs in upcoming matches
      const { data: knockoutTeams } = await supabase
        .from('knockout_teams')
        .select('*');
        
      if (knockoutTeams) {
        upcoming = upcoming.map(game => {
          const savedKnockout = knockoutTeams.find(k => k.match_id === game.id);
          if (savedKnockout) {
            return {
              ...game,
              homeTeam: savedKnockout.home_team,
              homeFlag: savedKnockout.home_flag,
              awayTeam: savedKnockout.away_team,
              awayFlag: savedKnockout.away_flag
            };
          }
          return game;
        });
      }
      
      setUpcomingGames(upcoming);
    };
    
    fetchTopPlayers();
    fetchMatchesData();

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <main className={styles.container}>
      <section className={styles.hero}>
        <p className={styles.subtitle}>
          Get ready for the biggest World Cup in history. 
          Make your predictions, challenge your friends, and reach the top of the leaderboard!
        </p>
        <div className={styles.actions}>
          {session ? (
            <>
              <button className="btn-primary" onClick={() => router.push('/predictions')}>My Predictions</button>
              <button className="btn-secondary" onClick={() => router.push('/results')}>Results</button>
              {session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
                <button className="btn-secondary" onClick={() => router.push('/admin')} style={{ borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}>Admin</button>
              )}
              <button className="btn-secondary" onClick={handleLogout}>Log Out</button>
            </>
          ) : (
            <>
              <button className="btn-primary" onClick={() => router.push('/login?mode=login')}>Login</button>
              <button className="btn-secondary" onClick={() => router.push('/login?mode=signup')}>Sign Up</button>
              <button className="btn-secondary" onClick={() => router.push('/results')}>Results</button>
            </>
          )}
        </div>
      </section>

      {upcomingGames.length > 0 && (
        <section className={styles.rankingSection} style={{ marginBottom: '40px' }}>
          <div className={styles.rankingHeader}>
            <h2>🔥 Upcoming Matches</h2>
            <Link href="/predictions" style={{ color: "var(--primary-color)", fontWeight: "600" }}>
              Predict &rarr;
            </Link>
          </div>
          
          <div className={`${styles.rankingList} glass-panel`} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {upcomingGames.map((game) => (
              <div key={game.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  {game.homeFlag !== 'un' && <img src={`https://flagcdn.com/w40/${game.homeFlag}.png`} alt={game.homeTeam} style={{ width: '28px', borderRadius: '4px' }} />}
                  <span style={{ fontWeight: '600', color: '#fff' }}>{game.homeTeam}</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 16px' }}>
                  <span suppressHydrationWarning style={{ fontSize: '0.9rem', color: 'var(--primary-color)', fontWeight: '800' }}>
                    {new Date(game.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>VS</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'flex-end' }}>
                  <span style={{ fontWeight: '600', color: '#fff' }}>{game.awayTeam}</span>
                  {game.awayFlag !== 'un' && <img src={`https://flagcdn.com/w40/${game.awayFlag}.png`} alt={game.awayTeam} style={{ width: '28px', borderRadius: '4px' }} />}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className={styles.rankingSection}>
        <div className={styles.rankingHeader}>
          <h2>Current Leaderboard</h2>
          <Link href="/ranking" style={{ color: "var(--primary-color)", fontWeight: "600" }}>
            View all &rarr;
          </Link>
        </div>
        
        <div className={`${styles.rankingList} glass-panel`}>
          {leaderboard.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "16px" }}>
              No one has scored points yet.
            </div>
          ) : (
            leaderboard.map((user, index) => (
              <div key={user.user_id} className={styles.rankingItem}>
                <div className={styles.rankPosInfo}>
                  <span className={styles.rankPos}>
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`}
                  </span>
                  <span className={styles.rankName}>{user.user_name}</span>
                </div>
                <span className={styles.rankPoints}>{user.total_points} pts</span>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
