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
        .limit(3);
        
      if (data) {
        setLeaderboard(data);
      }
    };
    
    fetchTopPlayers();

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Find the next match day
  const now = new Date();
  let nextMatchDateStr = null;
  const futureMatches = allMatches.filter(g => new Date(g.date) > now);
  if (futureMatches.length > 0) {
    const sortedFuture = futureMatches.sort((a, b) => new Date(a.date) - new Date(b.date));
    const nextMatch = sortedFuture[0];
    nextMatchDateStr = new Date(nextMatch.date).toISOString().split('T')[0];
  }

  const upcomingMatches = nextMatchDateStr 
    ? allMatches.filter(g => g.date.startsWith(nextMatchDateStr)) 
    : [];

  return (
    <main className={styles.container}>
      <section className={styles.hero}>
        <h1 className={`${styles.title} text-gradient`}>
          🏆 42 League
        </h1>
        <p className={styles.subtitle}>
          Get ready for the biggest World Cup in history. 
          Make your predictions, challenge your friends, and reach the top of the leaderboard!
        </p>
        <div className={styles.actions}>
          {session ? (
            <>
              <button className="btn-primary" onClick={() => router.push('/predictions')}>My Predictions</button>
              <button className="btn-secondary" onClick={handleLogout}>Log Out</button>
            </>
          ) : (
            <>
              <button className="btn-primary" onClick={() => router.push('/login?mode=login')}>Login</button>
              <button className="btn-secondary" onClick={() => router.push('/login?mode=signup')}>Sign Up</button>
            </>
          )}
        </div>
      </section>

      {upcomingMatches.length > 0 && (
        <section className={styles.rankingSection} style={{ marginBottom: '40px' }}>
          <div className={styles.rankingHeader}>
            <h2>🔥 Upcoming Matches</h2>
            <Link href="/predictions" style={{ color: "var(--primary-color)", fontWeight: "600" }}>
              Predict &rarr;
            </Link>
          </div>
          
          <div className={`${styles.rankingList} glass-panel`} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {upcomingMatches.map((game) => (
              <div key={game.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <img src={`https://flagcdn.com/w40/${game.homeFlag}.png`} alt={game.homeTeam} style={{ width: '28px', borderRadius: '4px' }} />
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
                  <img src={`https://flagcdn.com/w40/${game.awayFlag}.png`} alt={game.awayTeam} style={{ width: '28px', borderRadius: '4px' }} />
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
