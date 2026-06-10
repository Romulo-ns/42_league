import Link from "next/link";
import styles from "../home.module.css";

export default function Ranking() {
  const mockRanking = [
    { id: 1, name: "João", points: 0 },
    { id: 2, name: "Maria", points: 0 },
    { id: 3, name: "Romulo", points: 0 },
    { id: 4, name: "Pedro", points: 0 },
    { id: 5, name: "Ana", points: 0 },
  ];

  return (
    <main className={styles.container}>
      <Link href="/" style={{ color: "var(--text-muted)", marginBottom: "-20px" }}>
        &larr; Back to Home
      </Link>

      <div className={styles.hero} style={{ marginBottom: "0" }}>
        <h1 className="text-gradient">Global Leaderboard</h1>
        <p style={{ color: "var(--text-muted)" }}>The best predictions in the world!</p>
      </div>

      <section className={styles.rankingSection} style={{ animationDelay: "0.1s" }}>
        <div className={`${styles.rankingList} glass-panel`}>
          {mockRanking.map((user, index) => (
            <div key={user.id} className={styles.rankingItem}>
              <div className={styles.rankPosInfo}>
                <span className={styles.rankPos}>
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`}
                </span>
                <span className={styles.rankName}>{user.name}</span>
              </div>
              <span className={styles.rankPoints}>{user.points} pts</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
