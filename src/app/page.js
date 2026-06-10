"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./home.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
              <button className="btn-primary" onClick={() => router.push('/jogos')}>My Predictions</button>
              <button className="btn-secondary" onClick={handleLogout}>Log Out</button>
            </>
          ) : (
            <>
              <button className="btn-primary" onClick={() => router.push('/login')}>Login</button>
              <button className="btn-secondary" onClick={() => router.push('/login')}>Sign Up</button>
            </>
          )}
        </div>
      </section>

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
              Ninguém pontuou ainda.
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
