"use client";

import { useState } from "react";
import styles from "./jogos.module.css";
import Link from "next/link";

export default function Jogos() {
  const [scoreHome, setScoreHome] = useState("");
  const [scoreAway, setScoreAway] = useState("");

  const handleSave = () => {
    alert(`Prediction Saved: Mexico ${scoreHome} x ${scoreAway} Japan`);
  };

  return (
    <main className={styles.container}>
      <Link href="/" style={{ color: "var(--text-muted)", marginBottom: "-20px" }}>
        &larr; Back to Home
      </Link>

      <div className={styles.header}>
        <h1 className="text-gradient">Group Stage</h1>
        <p style={{ color: "var(--text-muted)" }}>Fill in the exact scores to earn more points!</p>
      </div>

      <section className={styles.groupSection}>
        <h2 className={styles.groupTitle}>Group A</h2>

        <div className={`glass-panel ${styles.matchCard}`}>
          <div className={styles.teamsRow}>
            <div className={styles.team}>
              <span className={styles.teamName}>🇲🇽 Mexico</span>
              <input 
                type="number" 
                className={styles.scoreInput} 
                min="0" 
                max="99" 
                value={scoreHome}
                onChange={(e) => setScoreHome(e.target.value)}
                placeholder="-"
              />
            </div>
            
            <span className={styles.vs}>X</span>

            <div className={styles.team}>
              <span className={styles.teamName}>🇯🇵 Japan</span>
              <input 
                type="number" 
                className={styles.scoreInput} 
                min="0" 
                max="99" 
                value={scoreAway}
                onChange={(e) => setScoreAway(e.target.value)}
                placeholder="-"
              />
            </div>
          </div>

          <div className={styles.actionRow}>
            <button className="btn-primary" onClick={handleSave}>Save Prediction</button>
          </div>
        </div>
      </section>
    </main>
  );
}
