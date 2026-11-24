# Atelier — Hosting & Deployment Guide

Atelier is a modern, standalone Next.js 16 application designed to be deployed instantly on any hosting provider **without requiring external database connections, ORMs, or authentication keys**.

---

## 🚀 Instant Deployment (Zero Configuration)

You can deploy this repository directly to any of the following platforms with default settings:

### 1. Vercel
1. Import this repository from GitHub into [Vercel](https://vercel.com).
2. Framework Preset: **Next.js**.
3. Environment Variables: **None required**.
4. Click **Deploy**.

### 2. Netlify
1. Import this repository from GitHub into [Netlify](https://netlify.com).
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Environment Variables: **None required**.
5. Click **Deploy**.

### 3. Render / Railway / Self-Hosted Docker
- Build Command: `npm install && npm run build`
- Start Command: `npm run start`
- Port: `3000`

---

## 📦 Architecture Notes
- **State Management**: Wardrobe items, custom outfits, capsules, and upload queue run locally with React Context + LocalStorage persistence.
- **Assets**: Authentic high-resolution menswear catalog imagery hosted via reliable CDNs.
- **Zero Lock-in**: No external database (Neon/PostgreSQL) or third-party auth (Clerk) dependencies required for core functionality.
