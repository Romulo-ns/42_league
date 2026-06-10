"use client";

import styles from "../home.module.css";
import Link from "next/link";

export default function MataMata() {
  return (
    <main className={styles.container}>
      <Link href="/" style={{ color: "var(--text-muted)", marginBottom: "-20px" }}>
        &larr; Back to Home
      </Link>

      <div className={styles.hero} style={{ marginBottom: "0" }}>
        <h1 className="text-gradient">Knockout Stage</h1>
        <p style={{ color: "var(--text-muted)" }}>Build your bracket starting from the Round of 32!</p>
      </div>

      <section className={styles.rankingSection} style={{ animationDelay: "0.1s" }}>
        <div className="glass-panel" style={{ textAlign: "center", padding: "40px 20px" }}>
          <h2>Coming Soon!</h2>
          <p style={{ color: "var(--text-muted)", marginTop: "16px", marginBottom: "24px" }}>
            The interactive 32-team bracket will be available once all 48 teams are confirmed in the group stage.
          </p>
          <button className="btn-secondary" onClick={() => alert('In development')}>Simulate Bracket</button>
        </div>
      </section>
    </main>
  );
}
