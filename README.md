# 🏆 42 League

42 League is a modern, responsive web application built for predicting match outcomes in a tournament (like the World Cup). Compete with your friends, submit your scores, and climb the leaderboard!

## 🚀 Features

- **User Authentication:** Secure sign-up, login, and password recovery powered by Supabase.
- **Match Predictions:** Submit score predictions for both Group Stage and Knockout matches.
- **Automatic Locking:** Matches automatically lock when they reach their kickoff time.
- **Dynamic Leaderboard:** Top players are ranked based on their prediction accuracy (exact scores, goal differences, correct winners).
- **Custom Nicknames:** Personalize your profile with a custom leaderboard nickname.
- **Modern UI:** Built with a premium, responsive glassmorphism design tailored for both desktop and mobile viewing.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Frontend:** React, Vanilla CSS (CSS Modules)
- **Backend/Auth:** [Supabase](https://supabase.com/)
- **Deployment:** Vercel (Recommended)

## 📦 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Romulo-ns/42_league.git
cd 42_league
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env.local` file in the root directory and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application running.

## 📝 Rules & Scoring

- **5 pts (Bullseye):** Guessed the exact score (e.g., predicted 2-1, ended 2-1).
- **3 pts (Winner + GD):** Guessed the winner and the goal difference (e.g., predicted 2-0, ended 3-1).
- **2 pts (Draw):** Guessed a draw but missed the exact scores (e.g., predicted 1-1, ended 2-2).
- **1 pt (Winner Only):** Guessed the winner but missed the goal difference (e.g., predicted 1-0, ended 3-0).

## 👤 Author

*romdo-na - 42 Porto student*
