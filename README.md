# 🎂 Birthday Wishes Studio (BD-wishes)

A premium, interactive digital greeting customizer built with **Next.js 16**, **React 19**, and **Prisma 7**. Birthday Wishes Studio lets you create, customize, and share stunning interactive birthday wishing pages with personalized themes, background music, floating effects, and custom letters.

---

## 🌟 Why is this project useful?

Traditionally, greeting cards are physical, easily lost, and static. Birthday Wishes Studio transforms digital greeting cards into immersive, interactive, and personalized web experiences:

- **Personalized & Interactive**: Instead of a simple text message, receivers get a custom page where they can interact with the card, play background music, and watch theme-specific visual animations (like falling confetti, stars, balloons, etc.).
- **Effortless Sharing**: Generate a unique sharable link in one click that the recipient can open instantly on any device.
- **Beautiful Design Presets**: Includes carefully designed themes ranging from elegant dark themes (*Midnight Gold*) to cosmic journeys (*Space Voyage*) and retro aesthetics (*Retro Neon*).
- **Music & Sound Effects**: Elevates the sensory experience by allowing creators to attach background tracks (like music box melodies, lofi tunes, or piano instrumentals).
- **Eco-Friendly & Instant**: Completely digital, reducing paper waste, and delivered instantly across the globe.

---

## 🚀 Key Features

- **Dynamic Theme Customizer**: Real-time interactive phone-device mockup preview so you can see exactly what the greeting page will look like.
- **Dual Mode Landing Page**: A fully responsive dashboard supporting smooth transitions between Premium Dark and Light modes.
- **Soundtrack Integration**: Option to toggle background music tracks (`Piano`, `Music Box`, `Lofi`, `None`).
- **Interactive Wishes View Page**: The shared link decodes the configurations to show a dedicated interactive wishing card tailored to the recipient.
- **Safe Database Architecture**: Powered by **Prisma 7** utilizing the `@prisma/adapter-pg` driver for reliable connection pooling and performance.
- **Passwordless Magic-Link Auth**: Simple, secure login using `Nodemailer` to verify and manage your saved collection.
- **Collection History**: Easily copy links or reopen your previously saved birthday wish cards.

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
SMTP_PASS="your-email-password"
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

### 6. Building for Production
To build the application for deployment (e.g. on Vercel):
```bash
pnpm run build
```

---

## 📄 MIT License

Copyright (c) 2026 Thilina Samarasinghe

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
