# 🎂 Birthday Wishes Studio (BD-wishes)

A premium, interactive digital greeting customizer built with **Next.js 16**, **React 19**, and **Prisma 7**. Birthday Wishes Studio lets you create, customize, and share stunning interactive birthday wishing pages with personalized themes, background music, floating effects, and custom letters.

---

## 🌟 Why is this project useful?

Traditionally, greeting cards are physical, easily lost, and static. Birthday Wishes Studio transforms digital greeting cards into immersive, interactive, and personalized web experiences:

- **Personalized & Interactive**: Instead of a simple text message, receivers get a custom page where they can interact with the card, play background music, and watch theme-specific visual animations (like falling confetti, stars, balloons, etc.).
- **Bilingual / Multi-language Support**: Fully supports English and Sinhala (සිංහල) for the creator customizer and receiver viewing pages, persisting recipient preferences dynamically.
- **Effortless Sharing**: Generate a unique sharable link in one click that the recipient can open instantly on any device.
- **Beautiful Design Presets**: Includes carefully designed themes ranging from elegant dark themes (*Midnight Gold*) to cosmic journeys (*Space Voyage*) and retro aesthetics (*Retro Neon*).
- **Music & Sound Effects**: Elevates the sensory experience by allowing creators to attach background tracks (like music box melodies, lofi tunes, or piano instrumentals).
- **Eco-Friendly & Instant**: Completely digital, reducing paper waste, and delivered instantly across the globe.

---

## 🚀 Key Features

- **Dynamic Theme Customizer**: Real-time interactive phone-device mockup preview so you can see exactly what the greeting page will look like.
- **14 Card Themes**: Includes designs with their own card shapes, such as *Golden Ticket*, *Memory Scrapbook*, and *Pixel Arcade*. To add a theme, add one entry to `src/lib/themes.tsx`.
- **Guest Mode**: Create and share a card by link without an account. Sign in to save cards, add photos, and view your history.
- **Dual Mode Landing Page**: A fully responsive dashboard supporting smooth transitions between Premium Dark and Light modes.
- **Bilingual Interface**: The toggle button (`🇱🇰 සිංහල` / `🇬🇧 EN`) at the top translates the website for the person using it.
- **Per-Card Language and Appearance**: Each card is sent in English or Sinhala and in dark or light, chosen by the sender and saved with the card. The website's own language and dark mode buttons do not affect the card.
- **Sound Preview and Birthday Song**: Tapping a sound plays it while choosing. The recipient hears the selected song from their first tap on the card, which browsers require before any sound can play.
- **Preview Before Sharing**: A full-screen preview shows the real card, and the app suggests it before a card is saved or its link is copied.
- **Mobile First**: The studio and cards are built for phone screens.
- **Soundtrack Integration**: Option to toggle background music tracks (`Piano`, `Music Box`, `Lofi`, `None`).
- **Interactive Wishes View Page**: The shared link decodes the configurations to show a dedicated interactive wishing card tailored to the recipient.
- **Safe Database Architecture**: Powered by **Prisma 7** utilizing the `@prisma/adapter-pg` driver for reliable connection pooling and performance.
- **Passwordless Magic-Link Auth**: Simple, secure login using `Nodemailer` to verify and manage your saved collection.
- **Collection History**: Easily copy links or reopen your previously saved birthday wish cards.

---

## 🎻 Credits

The Real Violin sound uses recordings from [VSCO 2: Community Edition](https://github.com/sgossner/VSCO-2-CE) by Versilian Studios (CC0).

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Frontend Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Database & ORM**: [Prisma 7](https://www.prisma.io/) with PostgreSQL & `@prisma/adapter-pg`
- **File Upload**: [Cloudinary](https://cloudinary.com/)
- **Mailer**: [Nodemailer](https://nodemailer.com/)

---

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- pnpm (v10+ recommended)
- PostgreSQL database instance

### 2. Environment Variables
Create a `.env` file in the root directory and add the following keys:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/bd_wishes?schema=public"
NEXT_AUTH_SECRET="your_secret_key"
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="your-email@example.com"
SMTP_PASSWORD="your-email-password"
SMTP_FROM="BD Wishes <your-email@example.com>"
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
```

### 3. Installation
Install the project dependencies using `pnpm`:
```bash
pnpm install
```

### 4. Database Setup & Client Generation
This project uses **Prisma 7**'s configuration file (`prisma.config.ts`) to manage database connections. Run the client generator to create the local DB typings:
```bash
pnpm prisma generate
```

### 5. Running Locally
Start the development server:
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the Birthday Wishes Studio.

> **Local database connection:** Some networks block Postgres port 5432. In development, the app reaches Neon databases through a WebSocket on port 443 to avoid this. Production uses the direct `pg` connection. Prisma CLI commands such as `prisma db push` still use port 5432, so they may need a different network.

### 6. Building for Production
To build the application for deployment (e.g. on Vercel):
```bash
pnpm run build
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
