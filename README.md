# Creafolio — Curated Portfolio & Design Reference Index

A clean, minimalist portfolio and design index built with **React 19, TypeScript, Tailwind CSS v4, and Vite**. Designed for saving, bookmarking, and organizing portfolio references with an interactive kinetic canvas background and Linear/Vercel design aesthetics.

---

## ✨ Features

- **Dynamic Interactive Background**: Interactive canvas kinetic grid background with mouse-follow and ripple physics (`kinetic-grid.tsx`).
- **Resizable Floating Navbar**: Scroll-morphing dynamic navbar (`resizable-navbar.tsx`).
- **Dual View Modes**: Switch between **Grid Cards** and **Experience-Style Row List** with thumbnail previews and quick action toolbars.
- **Instant Metadata Scraper**: Paste any portfolio URL — automatically indexes the site's title, description, cover image, and favicon via Microlink and Unavatar.
- **Zero Backend / Complete Privacy**: 100% client-side running purely in your browser using structured, deduplicated `localStorage`.
- **Pin & Filter**: Bookmark favorites, filter by category (*Portfolios, UI & Components, Inspiration, Tools & Resources*), and search in real-time.
- **Backup & Sync**: Export and import your collection as clean `.json` files or drag-and-drop backup files directly into the window.
- **PWA & Mobile Ready**: Full offline capability and responsive layout with touch-draggable category filters.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/) & [Tabler Icons](https://tabler.io/icons)
- **Animations**: [Motion](https://motion.dev/)

---

## 🚀 Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mrdeyroy/Creafolio.git
   cd Creafolio
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
