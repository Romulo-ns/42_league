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
    <>
      {/* Spacer para manter a altura do documento estática e evitar o bug do scroll */}
      <div style={{ height: isHome ? '88px' : '48px', width: '100%' }} />
      
      <div className={`${styles.fixedBanner} ${shouldShrink ? styles.scrolledBanner : ''}`}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <h1 className={`${styles.title} text-gradient ${shouldShrink ? styles.scrolledTitle : ''}`}>
            🏆 42 League
          </h1>
        </Link>
      </div>
    </>
  );
}
