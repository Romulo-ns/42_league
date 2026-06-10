import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  title: "42 League",
  description: "Predict the results of the 2026 World Cup!",
};

import Header from "@/components/Header";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={outfit.className} suppressHydrationWarning>
        <Header />
        {children}
      </body>
    </html>
  );
}
