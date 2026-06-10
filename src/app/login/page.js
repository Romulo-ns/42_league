"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState("login"); // "login", "signup", "forgot"

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    if (mode === "signup" || mode === "login" || mode === "forgot") {
      setAuthMode(mode);
    }
  }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (authMode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert("Registration successful! You can now log in.");
        setAuthMode("login");
      } else if (authMode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
      } else if (authMode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        alert("A password reset link has been sent to your email!");
        setAuthMode("login");
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
          {authMode === "signup"
            ? "Create Account"
            : authMode === "forgot"
            ? "Reset Password"
            : "Welcome Back"}
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          {authMode === "signup"
            ? "Sign up to start predicting!"
            : authMode === "forgot"
            ? "Enter your email to receive a password reset link."
            : "Log in to your 42 League account."}
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
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
          
          {authMode !== "forgot" && (
            <>
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

              {authMode === "login" && (
                <button
                  type="button"
                  className={styles.forgotLink}
                  onClick={() => setAuthMode("forgot")}
                >
                  Forgot password?
                </button>
              )}
            </>
          )}

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "8px" }}>
            {loading ? "Processing..." : authMode === "signup" ? "Sign Up" : authMode === "forgot" ? "Send Reset Link" : "Log In"}
          </button>
        </form>

        {authMode === "forgot" ? (
          <button className={styles.toggleMode} onClick={() => setAuthMode("login")}>
            Back to Login
          </button>
        ) : (
          <button className={styles.toggleMode} onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}>
            {authMode === "login" ? "Don't have an account? Sign up." : "Already have an account? Log in."}
          </button>
        )}
      </div>
    </main>
  );
}
