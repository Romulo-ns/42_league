"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import styles from "./reset-password.module.css";
import Link from "next/link";

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      alert("Password updated successfully! Redirecting...");
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
      <div className={`glass-panel ${styles.container}`}>
        <Link href="/login" style={{ color: "var(--text-muted)", alignSelf: "flex-start", marginBottom: "16px" }}>
          &larr; Back to Login
        </Link>
        
        <h1 className={`${styles.title} text-gradient`}>
          Reset Your Password
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Enter and confirm your new password below.
        </p>

        <form className={styles.form} onSubmit={handleUpdatePassword}>
          <div className={styles.inputGroup}>
            <label>New Password</label>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label>Confirm New Password</label>
            <input
              type="password"
              className={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "8px" }}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </main>
  );
}
