"use client";

import { useState } from "react";
import styles from "./jogos.module.css";
import Link from "next/link";

export default function Jogos() {
  const [scoreHome, setScoreHome] = useState("");
  const [scoreAway, setScoreAway] = useState("");

  const handleSave = () => {
    alert(`Palpite Salvo: México ${scoreHome} x ${scoreAway} Japão`);
  };

  return (
    <main className={styles.container}>
      <Link href="/" style={{ color: "var(--text-muted)", marginBottom: "-20px" }}>
        &larr; Voltar para Home
      </Link>

      <div className={styles.header}>
        <h1 className="text-gradient">Fase de Grupos</h1>
        <p style={{ color: "var(--text-muted)" }}>Preencha os placares exatos para pontuar mais!</p>
      </div>

      <section className={styles.groupSection}>
        <h2 className={styles.groupTitle}>Grupo A</h2>

        <div className={`glass-panel ${styles.matchCard}`}>
          <div className={styles.teamsRow}>
            <div className={styles.team}>
              <span className={styles.teamName}>🇲🇽 México</span>
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
              <span className={styles.teamName}>🇯🇵 Japão</span>
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
            <button className="btn-primary" onClick={handleSave}>Salvar Palpite</button>
          </div>
        </div>
      </section>
    </main>
  );
}
