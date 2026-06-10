"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const shouldShrink = !isHome || isScrolled;

  return (
    <div className={`${styles.stickyBanner} ${shouldShrink ? styles.scrolledBanner : ''}`}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <h1 className={`${styles.title} text-gradient ${shouldShrink ? styles.scrolledTitle : ''}`}>
          🏆 42 League
        </h1>
      </Link>
    </div>
  );
}
