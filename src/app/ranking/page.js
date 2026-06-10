"use client";

import { useState, useEffect } from "react";
import styles from "./ranking.module.css";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Ranking() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      // Query the user_scores view we created in Supabase
      const { data, error } = await supabase
        .from('user_scores')
        .select('*')
        .order('total_points', { ascending: false });

      if (error) {
        console.error("Error fetching leaderboard:", error);
      } else if (data) {
        setLeaderboard(data);
      }
      setIsLoading(false);
    };

    fetchRanking();
  }, []);

  if (isLoading) {
    return (
      <main className={styles.container}>
        <div className={styles.loading}>Loading the champions leaderboard...</div>
      </main>
    );
  }

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  // Helper to safely get initials
  const getInitials = (nameStr) => {
    if (!nameStr) return "?";
    return nameStr.substring(0, 2).toUpperCase();
  };


  return (
    <main className={styles.container}>
      <Link href="/" style={{ color: "var(--text-muted)", marginBottom: "20px", display: "inline-block" }}>
        &larr; Back to Home
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>Hall of Fame</h1>
        <p className={styles.subtitle}>The official leaderboard of the World Cup predictors.</p>
      </header>

      {leaderboard.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: "40px" }}>
          <h3 style={{ color: "#fff", marginBottom: "8px" }}>No one has scored points yet!</h3>
          <p style={{ color: "var(--text-muted)" }}>Official match results have not been recorded yet.</p>
        </div>
      ) : (
        <>
          {/* PODIUM */}
          {top3.length > 0 && (
            <div className={styles.podium}>
              {/* Silver - 2nd */}
              {top3[1] && (
                <div className={`${styles.podiumItem} ${styles.silver}`}>
                  <div className={styles.podiumAvatar}>{getInitials(top3[1].user_name)}</div>
                  <div className={styles.podiumName}>{top3[1].user_name}</div>
                  <div className={styles.podiumPoints}>{top3[1].total_points} pts</div>
                  <div className={styles.podiumBlock}>2</div>
                </div>
              )}
              
              {/* Gold - 1st */}
              {top3[0] && (
                <div className={`${styles.podiumItem} ${styles.gold}`}>
                  <div className={styles.podiumAvatar}>{getInitials(top3[0].user_name)}</div>
                  <div className={styles.podiumName}>{top3[0].user_name}</div>
                  <div className={styles.podiumPoints}>{top3[0].total_points} pts</div>
                  <div className={styles.podiumBlock}>1</div>
                </div>
              )}

              {/* Bronze - 3rd */}
              {top3[2] && (
                <div className={`${styles.podiumItem} ${styles.bronze}`}>
                  <div className={styles.podiumAvatar}>{getInitials(top3[2].user_name)}</div>
                  <div className={styles.podiumName}>{top3[2].user_name}</div>
                  <div className={styles.podiumPoints}>{top3[2].total_points} pts</div>
                  <div className={styles.podiumBlock}>3</div>
                </div>
              )}
            </div>
          )}

          {/* LIST */}
          {rest.length > 0 && (
            <div className={styles.rankingList}>
              {rest.map((user, index) => (
                <div key={user.user_id} className={styles.rankingRow}>
                  <div className={styles.position}>{index + 4}</div>
                  <div className={styles.userInfo}>
                    <div className={styles.avatar}>{getInitials(user.user_name)}</div>
                    <div className={styles.userName}>{user.user_name}</div>
                  </div>
                  <div className={styles.points}>
                    {user.total_points} <span className={styles.ptsLabel}>pts</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
