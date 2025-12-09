# Tankobon

A modern manga library management application built with Next.js. Track your manga collection, reading progress, and owned volumes all in one place.

Check out the live application: [tankobon.vercel.app](https://tankobon.vercel.app)

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)

## Features

- **User Authentication** - Secure sign-up and login with NextAuth.js
- **Manga Library Tracking** - Add manga to your personal library with custom statuses
- **Search & Browse** - Discover manga using the Jikan API (MyAnimeList)
  - Filter by type, status, and sort preferences
  - View trending and top-rated manga
- **Reading Progress** - Track chapters and volumes read
- **Collection Management** - Mark which physical volumes you own
- **Personal Ratings** - Rate manga on a 1-10 scale
- **Status Tracking** - Organize by Reading, Completed, Plan to Read, On Hold, or Dropped
- **Notes & Reviews** - Add personal notes to each entry

## Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **API:** [Jikan API](https://jikan.moe/) (MyAnimeList unofficial API)
- **Deployment:** [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tankobon.git
   cd tankobon
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/tankobon"

   # NextAuth
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

   **Generate a secure secret:**
   ```bash
   openssl rand -base64 32
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run migrations
   npx prisma db push

   # (Optional) Open Prisma Studio to view your data
   npx prisma studio
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
tankobon/
├── app/
│   ├── api/
│   │   ├── auth/          # NextAuth configuration
│   │   ├── library/       # Library CRUD operations
│   │   ├── manga/         # Manga search & fetch
│   │   └── profile/       # Profile stats fetch
│   ├── components/        # Reusable components
│   ├── library/           # Library page
│   ├── login/             # Authentication pages
│   ├── manga/[id]/        # Manga detail page
│   ├── profile/           # User profile & statistics
│   ├── register/          # User registration
│   ├── search/            # Manga search & discovery
│   ├── globals.css        # Global styles & Tailwind
│   ├── layout.tsx         # Root layout & navigation
│   ├── page.tsx           # Home/landing page
│   └── providers.tsx      # NextAuth session provider
├── lib/
│   └── prisma.ts         # Prisma client instance
├── prisma/
│   └── schema.prisma     # Database schema
└── public/               # Static assets
```

## Database Schema

Key models:
- **User** - User accounts with authentication
- **MangaLibrary** - User's manga entries with progress tracking
- **Session/Account** - NextAuth session management

View the full schema in `prisma/schema.prisma`.

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js | Generated with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your application URL | `http://localhost:3000` or production URL |

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy!

**Note:** Make sure your PostgreSQL database is accessible from Vercel. Consider using:
- [Vercel Postgres](https://vercel.com/storage/postgres)
- [Supabase](https://supabase.com/)
- [Railway](https://railway.app/)
- [Neon](https://neon.tech/)

## Usage

1. **Sign Up** - Create an account to start tracking manga
2. **Search** - Browse trending manga or search for specific titles
3. **Add to Library** - Click the + button to add manga to your collection
4. **Track Progress** - Update chapters read, volumes owned, and status
5. **Organize** - Filter by status (Reading, Completed, etc.) and sort your library
6. **Rate & Review** - Add personal ratings and notes

## Acknowledgments

- [Jikan API](https://jikan.moe/) for providing free MyAnimeList data
- [MyAnimeList](https://myanimelist.net/) for manga information
