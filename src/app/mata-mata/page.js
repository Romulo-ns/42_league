"use client";

import styles from "../home.module.css";
import Link from "next/link";

export default function MataMata() {
  return (
    <main className={styles.container}>
      <Link href="/" style={{ color: "var(--text-muted)", marginBottom: "-20px" }}>
        &larr; Voltar para Home
      </Link>

      <div className={styles.hero} style={{ marginBottom: "0" }}>
        <h1 className="text-gradient">Fase Mata-Mata</h1>
        <p style={{ color: "var(--text-muted)" }}>Monte sua chave a partir das Oitavas de Final!</p>
      </div>

      <section className={styles.rankingSection} style={{ animationDelay: "0.1s" }}>
        <div className="glass-panel" style={{ textAlign: "center", padding: "40px 20px" }}>
          <h2>Em Breve!</h2>
          <p style={{ color: "var(--text-muted)", marginTop: "16px", marginBottom: "24px" }}>
            A chave interativa com 32 seleções estará disponível para preenchimento assim que todos os 48 times forem confirmados na fase de grupos.
          </p>
          <button className="btn-secondary" onClick={() => alert('Em desenvolvimento')}>Simular Chave</button>
        </div>
      </section>
    </main>
  );
}
