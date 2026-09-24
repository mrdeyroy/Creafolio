# Creafolio — Minimalist Portfolio Index

A clean, minimalist portfolio index built with **Geist & Geist Mono** typography. Designed for effortless mobile and desktop bookmarking directly into your browser's local storage.

---

## Features

- **Mobile-First Quick Add**: Paste any portfolio URL — automatically indexes the title, description, cover image, and favicon.
- **Zero Backend / Zero Database**: 100% client-side running purely in your browser using `localStorage`.
- **Geist Typography & Linear/Vercel Aesthetic**: Ultra-refined monochromatic dark/light modes with precise micro-borders and clean SVG icons.
- **Instant GitHub Pages Deployment**: No build step needed. Just push to GitHub and enable Pages.
- **Pin & Filter**: Bookmark favorites, filter by category (*Design, Engineering, 3D & Motion, Brutalist, Minimal, Studio, etc.*), and search live.
- **Export & Import Backup**: Download your collection as JSON and sync across phone & laptop effortlessly.
- **PWA Ready**: Add to Home Screen on your mobile device for a native full-screen experience.

---

## GitHub Pages Deployment

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy Creafolio to GitHub Pages"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub.
   - Click **Settings** ➔ **Pages**.
   - Under **Build and deployment > Source**, select **Deploy from a branch**.
   - Under **Branch**, select `main` and `/ (root)` folder, then click **Save**.

---

## Local Development

```bash
npm run dev
```
Runs a local static preview server at `http://localhost:3000`.
