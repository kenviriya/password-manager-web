This is a password manager frontend built with [Next.js](https://nextjs.org).

## Live Demo / Portfolio

Portfolio link: [https://app.kenviriya.space/](https://app.kenviriya.space/)

You can try the app using:
- Email: `example@gmail.com`
- Password: `Example123`

## Deployment

This project is deployed from my home server using Coolify and exposed securely through a Cloudflare Tunnel.

## Purpose

This project is intended to showcase my understanding of Redux and React hooks in a practical application.

## Local Dev Setup (Frontend)

1. Create a frontend env file:

```bash
cp .env.example .env
```

2. Set `NEXT_PUBLIC_API_BASE_URL` in `.env` to your backend origin (example: `http://localhost:3000`).

3. Make sure the backend CORS config allows the frontend origin and credentials (`credentials: 'include'`) for session cookie auth (`sid`).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.
