"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert("Registration successful! You can now log in.");
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
      <div className={`glass-panel ${styles.container}`}>
        <Link href="/" style={{ color: "var(--text-muted)", alignSelf: "flex-start", marginBottom: "16px" }}>
          &larr; Back to Home
        </Link>
        
        <h1 className={`${styles.title} text-gradient`}>
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          {isSignUp ? "Sign up to start predicting!" : "Log in to your 42 League account."}
        </p>

        <form className={styles.form} onSubmit={handleAuth}>
          <div className={styles.inputGroup}>
            <label>Email</label>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label>Password</label>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "8px" }}>
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Log In"}
          </button>
        </form>

        <button className={styles.toggleMode} onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? "Already have an account? Log in." : "Don't have an account? Sign up."}
        </button>
      </div>
    </main>
  );
}
