# Creafolio

### The Vibe Coder's Vault

**Stop searching. Start building.**

Creafolio is a curated library of AI tools, UI components, creative websites, developer resources, and design inspiration. Built for vibe coders, designers, and curious builders who want to spend less time hunting for resources and more time creating.

<p align="center">
  <a href="https://creafolio.vercel.app"><strong>Explore Creafolio →</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel" alt="Vercel" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="MIT License" />
</p>

---

## ✦ Why Creafolio?

Finding good resources shouldn't take longer than using them.

As a vibe coder, I often find myself exploring new AI tools, browsing inspiring websites, and searching for useful UI libraries. I built Creafolio to collect those discoveries in one organized place, both for myself and for other people who love exploring and building things.

Whether you're designing a landing page, experimenting with AI, or looking for your next creative reference, Creafolio helps you find something worth exploring.

## ✨ Features

- **Curated Collections:** Explore resources organized into collections designed around real creative and development workflows.
- **Smart Search:** Find resources by title, domain, description, collection, or tags.
- **Advanced Filtering:** Combine collection and tag filters to narrow down your search.
- **Resource Previews:** Browse website screenshots, favicons, and available video previews.
- **Grid & List Views:** Switch between visual cards and a compact browsing experience.
- **Saved Resources:** Bookmark useful websites and revisit them whenever you need them.
- **Featured Resources:** Discover handpicked resources highlighted in the library.
- **Automatic Metadata:** Add a URL and retrieve available website metadata, including titles, descriptions, images, and favicons.
- **Responsive Interface:** Explore the library across desktop, tablet, and mobile devices.
- **Interactive Background:** A kinetic grid adds subtle movement and depth to the browsing experience.

## 🗂️ Collections

Creafolio organizes resources into ten collections:

| Collection | What you'll find |
|---|---|
| UI & Components | Component libraries and reusable UI elements |
| Landing Pages | Landing page designs and website layouts |
| Portfolios | Personal portfolios and creative showcases |
| Design Systems | Design systems and UI foundations |
| Animations & Interactions | Motion effects and interactive experiences |
| 3D & WebGL | 3D websites and creative engineering |
| AI Tools | AI-powered tools for building and creating |
| Developer Tools | Utilities that improve development workflows |
| Fonts, Icons & Assets | Typography, icons, illustrations, and visual assets |
| Inspiration & Experiments | Unusual websites and creative experiments |

A resource can belong to multiple collections, making it easier to discover through different workflows.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| [React 19](https://react.dev/) | User interface |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Vite](https://vite.dev/) | Development server and build tooling |
| [Tailwind CSS v4](https://tailwindcss.com/) | Styling |
| [Motion](https://motion.dev/) | Animations and interactions |
| [Lucide React](https://lucide.dev/) | Icons |
| [Tabler Icons](https://tabler.io/icons) | Additional icons |
| [Supabase](https://supabase.com/) | PostgreSQL database and authentication |
| [Vercel](https://vercel.com/) | Deployment and web analytics |

## 🚀 Getting Started

### Prerequisites

- Node.js and npm
- Git
- A Supabase project for database-backed features

### 1. Clone the repository

```bash
git clone https://github.com/mrdeyroy/Creafolio.git
cd Creafolio
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root and add the Supabase credentials required by the application.

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
```

Use the exact variable names expected by the current application. If your project uses a different public-key variable name, follow the existing configuration.

**Security:** Never expose your Supabase service-role key in frontend code or commit real credentials to GitHub. Configure production environment variables separately in Vercel.

### 4. Start the development server

```bash
npm run dev
```

Open the local URL printed in your terminal. If your Vite configuration uses port `3000`, the address will be `http://localhost:3000`.

### 5. Build for production

```bash
npm run build
```

To check the available project scripts:

```bash
npm run
```

## 🏗️ Project Structure

The project follows a component-based React architecture.

```text
Creafolio/
├── public/              # Static assets
├── src/
│   ├── components/      # UI components
│   ├── lib/             # Utilities and shared services
│   ├── App.tsx          # Application and routing
│   ├── main.tsx         # Application entry point
│   ├── types.ts         # TypeScript definitions
│   └── index.css        # Global styles
├── supabase/            # Database configuration and migrations
├── scripts/             # Project utilities
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

*The structure above is representative. Individual folders may vary as the project evolves.*

## 🌐 Deployment

Creafolio is deployed on Vercel.

**Live website:** https://creafolio.vercel.app

For your own deployment:

1. Import the repository into Vercel.
2. Configure the required environment variables.
3. Verify the production build settings.
4. Deploy the application.
5. Configure Supabase authentication redirect URLs for your production domain.

## 🔐 Security

- Public visitors should have read-only access to published resources.
- Resource management should be restricted to the authorized administrator.
- Supabase Row Level Security (RLS) should enforce database permissions.
- Privileged credentials must remain server-side and must never be exposed to the browser.

## 🗺️ Roadmap

Potential improvements as Creafolio grows:

- [ ] More curated resources and collections
- [ ] Improved resource discovery
- [ ] Better offline preview support
- [ ] Community resource suggestions with admin approval
- [ ] Continued performance and accessibility improvements

## 🤝 Contributing

Creafolio is a personal curation project, but suggestions and ideas are welcome.

Found an interesting AI tool, UI library, or creative website? Share it with me through the repository's Issues section or the project's available contact channels.

Not every suggestion will be added, but good discoveries are always appreciated.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  <strong>Built for people who love exploring the web and building things.</strong>
  <br />
  <a href="https://creafolio.vercel.app">Explore Creafolio</a>
</p>
