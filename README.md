# 🎂 Birthday Wishes Studio (BD-wishes)

[**Scroll down for Sinhala Language Version / සිංහල භාෂාවෙන් කියවීමට පහළට යන්න**](#-උපන්දින-සුභපැතුම්-ස්ටුඩියෝව-bd-wishes)

A premium, interactive digital greeting customizer built with **Next.js 16**, **React 19**, and **Prisma 7**. Birthday Wishes Studio lets you create, customize, and share stunning interactive birthday wishing pages with personalized themes, background music, floating effects, and custom letters.

---

## 🌟 Why is this project useful?

Traditionally, greeting cards are physical, easily lost, and static. Birthday Wishes Studio transforms digital greeting cards into immersive, interactive, and personalized web experiences:

- **Personalized & Interactive**: Instead of a simple text message, receivers get a custom page where they can interact with the card, play background music, and watch theme-specific visual animations (like falling confetti, stars, balloons, etc.).
- **Bilingual Interface (English & Sinhala)**: Supports complete translation toggles (`🇱🇰 සිංහල` / `🇬🇧 EN`) for both customizer dashboards and receiver pages, retaining the user's preferred language upon loading or sharing.
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

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---
---

# 🎂 උපන්දින සුභපැතුම් ස්ටුඩියෝව (BD-wishes)

**Next.js 16**, **React 19**, සහ **Prisma 7** තාක්‍ෂණයන් මඟින් නිර්මාණය කරන ලද උසස් මට්ටමේ, සජීවී ඩිජිටල් උපන්දින සුභපැතුම් පත් සැකසුම්කරණයකි. මෙම Birthday Wishes Studio මඟින් විවිධ පසුබිම් තේමා, ගීත, පාවෙන සජීවීකරණ සහ පුද්ගලීකරණය කළ සුභපැතුම් ලිපි ඇතුළත් කර අලංකාර සුභපැතුම් පත් නිර්මාණය කිරීමට සහ බෙදා ගැනීමට ඉඩ සලසයි.

---

## 🌟 මෙම ව්‍යාපෘතිය ප්‍රයෝජනවත් වන්නේ ඇයි?

සාම්ප්‍රදායික සුභපැතුම් පත් සාමාන්‍යයෙන් කඩදාසිවලින් නිපදවන අතර පහසුවෙන් නැතිවීමට ඉඩ ඇත. උපන්දින සුභපැතුම් ස්ටුඩියෝව මඟින් මෙම අත්දැකීම සම්පූර්ණයෙන්ම සජීවී සහ පුද්ගලීකරණය කළ ඩිජිටල් අත්දැකීමක් බවට පත් කරයි:

- **පුද්ගලීකරණය සහ අන්තර්ක්‍රියාකාරී බව**: සරල කෙටි පණිවිඩයක් වෙනුවට, ලබන්නාට පසුබිම් සංගීතය වාදනය කළ හැකි අතර වර්ණවත් සජීවීකරණ (පාවෙන බැලූන්, පිඹ නිවා දැමිය හැකි ඉටිපන්දම්, කොන්ෆෙට්ටි වර්ෂාව) සහිත පිටුවක් හිමිවේ.
- **ද්විභාෂා සහය (සිංහල සහ ඉංග්‍රීසි)**: කාඩ්පත් සාදන පිටුව සහ කාඩ්පත නරඹන පිටුව යන දෙකටම සම්පූර්ණ භාෂා තේරීමේ පහසුකම (`🇱🇰 සිංහල` / `🇬🇧 EN`) ඇත. යවන සබැඳියට අනුව අවශ්‍ය භාෂාව ස්වයංක්‍රීයව තීරණය වේ.
- **පහසුවෙන් බෙදා ගැනීම**: ඕනෑම ජංගම දුරකථනයකින් හෝ පරිගණකයකින් ක්ෂණිකව විවෘත කළ හැකි අද්විතීය සබැඳියක් (link) එක ක්ලික් එකකින් ලබා ගත හැක.
- **විචිත්‍රවත් මෝස්තර තේමා**: අලංකාර රන්වන් පැහැති තේමා (*Midnight Gold*), තරු පිරුණු විශ්වීය තේමා (*Space Voyage*) සහ සයිබර්පන්ක් තේමා (*Retro Neon*) රැසක් ඇතුළත් වේ.
- **සංගීතය සහ හඬ එකතු කිරීම**: Piano, Music Box, හෝ Lofi සංගීත ඛණ්ඩ සුභපැතුම් පතට එක් කිරීමට ඉඩ සැලසීමෙන් ආකර්ෂණීය බව වැඩි කරයි.
- **පරිසර හිතකාමී සහ වේගවත්**: කඩදාසි භාවිතයක් නොමැති නිසා පරිසරයට හිතකාමී වන අතර ක්ෂණිකව ලොව පුරා සිටින ඕනෑම අයෙකුට යැවිය හැක.

---

## 🚀 ප්‍රධාන විශේෂාංග

- **සජීවී පෙරදසුන් තිරය**: ඔබ වෙනස් කරන දේ ජංගම දුරකථන ආකෘතියක් මඟින් සජීවීව බලාගත හැක.
- **ද්විත්ව තේමා පිටුව (Light & Dark)**: පරිශීලක අභිමතය පරිදි කළු (Obsidian Dark) සහ සුදු (Clean Light) පසුබිම් මාතයන් අතර මාරු විය හැක.
- **පසුබිම් සංගීතය**: Piano, Music Box, හෝ Lofi ගීත පසුබිමට එක් කිරීමේ හැකියාව.
- **අන්තර්ක්‍රියාකාරී සුභපැතුම් පිටුව**: යවන ලද සබැඳිය (link) විවෘත කළ විට ලබන්නාට තෑගි පෙට්ටියක් හැරීමට, ඉටිපන්දම් පිඹීමට සහ මතක පින්තූර නැරඹීමට හැකි සජීවී අත්දැකීමක් ලැබේ.
- **ආරක්ෂිත දත්ත සමුදාය**: PostgreSQL සමඟ Prisma 7 භාවිතා කර ඇති අතර, විශ්වසනීය සබඳතා කළමනාකරණය සඳහා `@prisma/adapter-pg` යොදා ගනී.
- **මුරපද රහිත ආරක්ෂිත ඇතුළුවීම**: Nodemailer මගින් විද්‍යුත් තැපෑලට එවනු ලබන මැජික් සබැඳියකින් (Magic Link) ඔබගේ ගිණුමට පහසුවෙන් ඇතුළත් විය හැක.
- **පෙර නිර්මාණ ඉතිහාසය**: ඔබ සාදන ලද සියලුම උපන්දින පත් ලැයිස්තුව නැවත බැලීමට, පිටපත් කිරීමට හෝ මැකීමට ඇති හැකියාව.

---

## 🛠️ භාවිතා කරන ලද තාක්ෂණික මෙවලම්

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Frontend Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Database & ORM**: [Prisma 7](https://www.prisma.io/) with PostgreSQL & `@prisma/adapter-pg`
- **File Upload**: [Cloudinary](https://cloudinary.com/)
- **Mailer**: [Nodemailer](https://nodemailer.com/)

---

## ⚙️ ආරම්භ කිරීම සඳහා උපදෙස්

### 1. පූර්ව අවශ්‍යතා
- Node.js (v18+ නිර්දේශිතයි)
- pnpm (v10+ නිර්දේශිතයි)
- PostgreSQL දත්ත සමුදායක් (Database instance)

### 2. පරිසර විචල්‍යයන් (Environment Variables)
ව්‍යාපෘතියේ ප්‍රධාන ෆෝල්ඩරය තුළ `.env` නමින් ගොනුවක් සාදා පහත සඳහන් යතුරු ඇතුළත් කරන්න:
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

### 3. ස්ථාපනය කිරීම
පහත දැක්වෙන විධානය මඟින් අවශ්‍ය පැකේජ ස්ථාපනය කරගන්න:
```bash
pnpm install
```

### 4. දත්ත සමුදාය සකස් කිරීම
මෙම ව්‍යාපෘතිය Prisma 7 හි (`prisma.config.ts`) ගොනුව භාවිතා කරයි. දත්ත සමුදා සබඳතා සකස් කිරීමට පහත විධානය ක්‍රියාත්මක කරන්න:
```bash
pnpm prisma generate
```

### 5. දේශීයව ධාවනය කිරීම (Run Locally)
සංවර්ධන සේවාදායකය (development server) ආරම්භ කරන්න:
```bash
pnpm dev
```
ඔබගේ බ්‍රවුසරයෙන් [http://localhost:3000](http://localhost:3000) වෙත පිවිසෙන්න.

### 6. නිෂ්පාදනය සඳහා සකස් කිරීම (Build for Production)
ව්‍යාපෘතිය Vercel වැනි සේවාදායකයකට යෙදවීම (deploy) සඳහා:
```bash
pnpm run build
```

---

## 📄 බලපත්‍රය

මෙම ව්‍යාපෘතිය [MIT බලපත්‍රය](LICENSE) යටතේ නිදහස් මෘදුකාංගයක් ලෙස නිකුත් කර ඇත.
