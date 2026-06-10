import styles from "./home.module.css";
import Link from "next/link";

export default function Home() {
  const mockRanking = [
    { id: 1, name: "João", points: 245 },
    { id: 2, name: "Maria", points: 230 },
    { id: 3, name: "Romulo", points: 220 },
  ];

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
          <button className="btn-primary">Login</button>
          <button className="btn-secondary">Sign Up</button>
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
