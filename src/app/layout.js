import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  title: "World Cup Predictor 2026",
  description: "Preveja os resultados da Copa do Mundo 2026!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={outfit.className}>{children}</body>
    </html>
  );
}
