/**
 * ═══════════════════════════════════════════════════════════════
 * CREAFOLIO — Client-Side Application Logic
 * Portfolios, UI Component Libraries & Design References
 * ═══════════════════════════════════════════════════════════════
 */

// Storage Keys
const STORAGE_KEY = "creafolio_vault_master";
const THEME_KEY = "creafolio_theme_master";
const VIEW_MODE_KEY = "creafolio_view_mode_master";

// Curated Starter Dataset (Portfolios + Component Libraries + Tools)
const DEFAULT_PORTFOLIOS = [
  {
    id: "seed-1",
    url: "https://21st.dev",
    title: "21st.dev — The NPM for Design Engineers",
    domain: "21st.dev",
    category: "UI & Components",
    description: "Open-source community component library with copy-paste Tailwind and React micro-interactions.",
    image: "https://image.thum.io/get/width/800/crop/600/https://21st.dev",
    icon: "https://unavatar.io/21st.dev?fallback=https://icons.duckduckgo.com/ip3/21st.dev.ico",
    tags: ["UI Components", "Tailwind", "React"],
    pinned: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7
  },
  {
    id: "seed-2",
    url: "https://ui.aceternity.com",
    title: "Aceternity UI",
    domain: "ui.aceternity.com",
    category: "UI & Components",
    description: "Trending animated components built with Framer Motion and Tailwind CSS for modern landing pages.",
    image: "https://image.thum.io/get/width/800/crop/600/https://ui.aceternity.com",
    icon: "https://unavatar.io/ui.aceternity.com?fallback=https://icons.duckduckgo.com/ip3/ui.aceternity.com.ico",
    tags: ["UI Components", "Framer Motion", "Animations"],
    pinned: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6
  },
  {
    id: "seed-3",
    url: "https://bruno-simon.com",
    title: "Bruno Simon",
    domain: "bruno-simon.com",
    category: "Portfolios",
    description: "Interactive 3D physics portfolio built with Three.js and custom vehicle simulation.",
    image: "https://image.thum.io/get/width/800/crop/600/https://bruno-simon.com",
    icon: "https://unavatar.io/bruno-simon.com?fallback=https://icons.duckduckgo.com/ip3/bruno-simon.com.ico",
    tags: ["3D / WebGL", "Interactive", "Creative Dev"],
    pinned: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5
  },
  {
    id: "seed-4",
    url: "https://pavelstetkevych.com",
    title: "Pavel Stetkevych",
    domain: "pavelstetkevych.com",
    category: "Portfolios",
    description: "Editorial digital product design portfolio with refined typography and micro-interactions.",
    image: "https://image.thum.io/get/width/800/crop/600/https://pavelstetkevych.com",
    icon: "https://unavatar.io/pavelstetkevych.com?fallback=https://icons.duckduckgo.com/ip3/pavelstetkevych.com.ico",
    tags: ["Design", "Dark Mode", "Product"],
    pinned: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4
  },
  {
    id: "seed-5",
    url: "https://magicui.design",
    title: "Magic UI",
    domain: "magicui.design",
    category: "UI & Components",
    description: "UI library for design engineers offering 50+ animated components for landing pages.",
    image: "https://image.thum.io/get/width/800/crop/600/https://magicui.design",
    icon: "https://unavatar.io/magicui.design?fallback=https://icons.duckduckgo.com/ip3/magicui.design.ico",
    tags: ["UI Components", "React", "Motion"],
    pinned: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3
  },
  {
    id: "seed-6",
    url: "https://siteinspire.com",
    title: "Siteinspire",
    domain: "siteinspire.com",
    category: "Inspiration",
    description: "Showcase of the finest web and interactive design from around the world.",
    image: "https://image.thum.io/get/width/800/crop/600/https://siteinspire.com",
    icon: "https://unavatar.io/siteinspire.com?fallback=https://icons.duckduckgo.com/ip3/siteinspire.com.ico",
    tags: ["Inspiration", "Web Design", "Showcase"],
    pinned: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2
  },
  {
    id: "seed-7",
    url: "https://rauno.me",
    title: "Rauno Freiberg",
    domain: "rauno.me",
    category: "Portfolios",
    description: "Design Engineer at Vercel. Crafting invisible details and high-polish user interfaces.",
    image: "https://image.thum.io/get/width/800/crop/600/https://rauno.me",
    icon: "https://unavatar.io/rauno.me?fallback=https://icons.duckduckgo.com/ip3/rauno.me.ico",
    tags: ["Design Engineering", "Minimal", "Craft"],
    pinned: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1
  },
  {
    id: "seed-8",
    url: "https://www.realtimecolors.com",
    title: "Realtime Colors",
    domain: "realtimecolors.com",
    category: "Tools & Resources",
    description: "Visualize UI color palettes and typography in real-time on actual website layouts.",
    image: "https://image.thum.io/get/width/800/crop/600/https://www.realtimecolors.com",
    icon: "https://unavatar.io/realtimecolors.com?fallback=https://icons.duckduckgo.com/ip3/realtimecolors.com.ico",
    tags: ["Colors", "Design Tools", "Generators"],
    pinned: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 12
  }
];

// App State
let portfolios = [];
let activeTag = "all";
let searchQuery = "";
let viewMode = "grid";
let pendingConfirmCallback = null;

// DOM Elements
const quickAddForm = document.getElementById("quickAddForm");
const quickUrlInput = document.getElementById("quickUrlInput");
const pasteClipboardBtn = document.getElementById("pasteClipboardBtn");
const quickSubmitBtn = document.getElementById("quickSubmitBtn");
const portfolioGrid = document.getElementById("portfolioGrid");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const tagFilters = document.getElementById("tagFilters");
const statsBadge = document.getElementById("statsBadge");
const galleryCountText = document.getElementById("galleryCountText");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const viewGridBtn = document.getElementById("viewGridBtn");
const viewCompactBtn = document.getElementById("viewCompactBtn");

// Modal Elements
const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const editId = document.getElementById("editId");
const editUrl = document.getElementById("editUrl");
const editTitle = document.getElementById("editTitle");
const editCategory = document.getElementById("editCategory");
const editImage = document.getElementById("editImage");
const editDesc = document.getElementById("editDesc");
const editTags = document.getElementById("editTags");
const modalTitle = document.getElementById("modalTitle");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const refetchMetaBtn = document.getElementById("refetchMetaBtn");
const openAddModalBtn = document.getElementById("openAddModalBtn");
const mobileFabBtn = document.getElementById("mobileFabBtn");
const emptyAddBtn = document.getElementById("emptyAddBtn");

// Backup Modal Elements
const backupModal = document.getElementById("backupModal");
const backupModalBtn = document.getElementById("backupModalBtn");
const closeBackupModalBtn = document.getElementById("closeBackupModalBtn");
const exportJsonBtn = document.getElementById("exportJsonBtn");
const importJsonInput = document.getElementById("importJsonInput");
const resetDefaultsBtn = document.getElementById("resetDefaultsBtn");
const toastContainer = document.getElementById("toastContainer");

// Bootstrap
function initApp() {
  try {
    activeTag = "all";
    searchQuery = "";
    if (searchInput) searchInput.value = "";
    
    loadTheme();
    loadViewMode();
    loadPortfolios();
    bindEvents();
    render();
    refreshIcons();
    initKineticGrid();
  } catch (err) {
    console.error("Initialization error:", err);
    // Fail-safe render
    render();
  }
}

// ═══════════════════════════════════════════════════════════════
// KINETIC GRID INTERACTIVE BACKGROUND
// ═══════════════════════════════════════════════════════════════
function initKineticGrid() {
  const canvas = document.getElementById("kineticGridCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const CELL_SIZE = 55;
  const INFLUENCE_RADIUS = 260;
  const MAX_WARP = 24;
  const DOT_SPACING = 28;
  const LERP_SPEED = 0.08;

  const NODE_BASE_RADIUS = 1.8;
  const NODE_ACTIVE_RADIUS = 3.2;

  let mouse = { x: -9999, y: -9999 };
  let targetMouse = { x: -9999, y: -9999 };
  let ripples = [];
  let size = { w: window.innerWidth, h: window.innerHeight };

  function setSize() {
    size.w = window.innerWidth;
    size.h = window.innerHeight;
    canvas.width = size.w;
    canvas.height = size.h;
  }
  setSize();
  window.addEventListener("resize", setSize);

  window.addEventListener("mousemove", (e) => {
    targetMouse.x = e.clientX;
    targetMouse.y = e.clientY;
  });

  window.addEventListener("click", (e) => {
    ripples.push({
      x: e.clientX,
      y: e.clientY,
      radius: 0,
      opacity: 1,
      born: performance.now()
    });
  });

  function lerpN(a, b, t) {
    return a + (b - a) * t;
  }

  function lerpColor(base, active, t) {
    const r = Math.round(lerpN(base.r, active.r, t));
    const g = Math.round(lerpN(base.g, active.g, t));
    const b = Math.round(lerpN(base.b, active.b, t));
    const a = lerpN(base.a, active.a, t);
    return `rgba(${r},${g},${b},${a.toFixed(3)})`;
  }

  function getWarpedPoint(gx, gy, col, row, cols, rows) {
    const edgeMargin = 1.5;
    const colPin = Math.min(col / edgeMargin, (cols - 1 - col) / edgeMargin, 1);
    const rowPin = Math.min(row / edgeMargin, (rows - 1 - row) / edgeMargin, 1);
    const pinFactor = colPin * colPin * rowPin * rowPin;

    const dx = gx - mouse.x;
    const dy = gy - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const proximity = Math.max(0, 1 - dist / INFLUENCE_RADIUS) * pinFactor;

    let rx = 0, ry = 0;
    for (const r of ripples) {
      const rdx = gx - r.x;
      const rdy = gy - r.y;
      const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
      const waveWidth = 55;
      const diff = rdist - r.radius;
      if (Math.abs(diff) < waveWidth) {
        const strength = (1 - Math.abs(diff) / waveWidth) * r.opacity * 18 * pinFactor;
        const angle = Math.atan2(rdy, rdx);
        const sign = diff < 0 ? -1 : 1;
        rx += Math.cos(angle) * strength * sign * -1;
        ry += Math.sin(angle) * strength * sign * -1;
      }
    }

    if (dist < INFLUENCE_RADIUS && dist > 0 && pinFactor > 0) {
      const t = dist / INFLUENCE_RADIUS;
      const eased = t < 0.01 ? 0 : (1 - t) * (1 - t) * Math.min(1, dist / 60);
      const warpAmt = eased * MAX_WARP * pinFactor;
      const angle = Math.atan2(dy, dx);
      return {
        pt: {
          x: gx - Math.cos(angle) * warpAmt + rx,
          y: gy - Math.sin(angle) * warpAmt + ry
        },
        proximity
      };
    }

    return { pt: { x: gx + rx, y: gy + ry }, proximity };
  }

  function draw(now) {
    const W = size.w;
    const H = size.h;
    const isDark = document.body.getAttribute("data-theme") !== "light";

    const theme = isDark ? {
      bg: "#09090b",
      dotFill: "rgba(255,255,255,0.035)",
      lineBase: { r: 255, g: 255, b: 255, a: 0.06 },
      lineActive: { r: 255, g: 255, b: 255, a: 0.75 },
      nodeActive: { r: 255, g: 255, b: 255, a: 1.0 },
      glow: "255,255,255",
      ripple: "255,255,255"
    } : {
      bg: "#fafafa",
      dotFill: "rgba(0,0,0,0.03)",
      lineBase: { r: 0, g: 0, b: 0, a: 0.04 },
      lineActive: { r: 0, g: 0, b: 0, a: 0.65 },
      nodeActive: { r: 0, g: 0, b: 0, a: 0.95 },
      glow: "0,0,0",
      ripple: "0,0,0"
    };

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, W, H);

    // Static background dot texture
    ctx.fillStyle = theme.dotFill;
    for (let x = DOT_SPACING / 2; x < W; x += DOT_SPACING) {
      for (let y = DOT_SPACING / 2; y < H; y += DOT_SPACING) {
        ctx.beginPath();
        ctx.arc(x, y, 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Update ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      const age = (now - r.born) / 1000;
      r.radius = Math.max(0, age * 400);
      r.opacity = Math.max(0, 1 - age * 1.2);
      if (r.opacity <= 0) ripples.splice(i, 1);
    }

    // Warped grid points
    const cols = Math.max(2, Math.ceil(W / CELL_SIZE)) + 1;
    const rows = Math.max(2, Math.ceil(H / CELL_SIZE)) + 1;
    const cellW = W / (cols - 1);
    const cellH = H / (rows - 1);

    const pts = [];
    const prox = [];

    for (let row = 0; row < rows; row++) {
      pts[row] = [];
      prox[row] = [];
      for (let col = 0; col < cols; col++) {
        const { pt, proximity } = getWarpedPoint(col * cellW, row * cellH, col, row, cols, rows);
        pts[row][col] = pt;
        prox[row][col] = proximity;
      }
    }

    // Draw grid lines
    const drawSeg = (p1, p2, pr1, pr2) => {
      const avg = (pr1 + pr2) / 2;
      const t = avg * avg * (3 - 2 * avg); // smoothstep
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = lerpColor(theme.lineBase, theme.lineActive, t);
      ctx.lineWidth = lerpN(0.75, 1.4, t);
      ctx.stroke();
    };

    ctx.lineCap = "butt";

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols - 1; col++) {
        drawSeg(pts[row][col], pts[row][col + 1], prox[row][col], prox[row][col + 1]);
      }
    }

    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows - 1; row++) {
        drawSeg(pts[row][col], pts[row + 1][col], prox[row][col], prox[row + 1][col]);
      }
    }

    // Intersection nodes
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const p = pts[row][col];
        const pr = prox[row][col];
        const t = pr * pr * (3 - 2 * pr);
        const r = lerpN(NODE_BASE_RADIUS, NODE_ACTIVE_RADIUS, t);

        if (t > 0.3) {
          const glowR = r + lerpN(0, 6, (t - 0.3) / 0.7);
          const grd = ctx.createRadialGradient(p.x, p.y, r * 0.5, p.x, p.y, glowR);
          grd.addColorStop(0, `rgba(${theme.glow},${(t * 0.3).toFixed(3)})`);
          grd.addColorStop(1, `rgba(${theme.glow},0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = lerpColor({ r: isDark ? 255 : 0, g: isDark ? 255 : 0, b: isDark ? 255 : 0, a: 0.12 }, theme.nodeActive, t);
        ctx.fill();
      }
    }

    // Ripple rings
    for (const r of ripples) {
      const safeRadius = Math.max(0, r.radius);
      ctx.beginPath();
      ctx.arc(r.x, r.y, safeRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${theme.ripple},${(r.opacity * 0.28).toFixed(3)})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  function animate(now) {
    mouse.x = lerpN(mouse.x, targetMouse.x, LERP_SPEED);
    mouse.y = lerpN(mouse.y, targetMouse.y, LERP_SPEED);

    draw(now);
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

// Theme
function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || "dark";
  document.body.setAttribute("data-theme", savedTheme);
}

function toggleTheme() {
  const current = document.body.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.body.setAttribute("data-theme", next);
  localStorage.setItem(THEME_KEY, next);
  showToast(`Theme: ${next}`);
}

// View Mode
function loadViewMode() {
  viewMode = localStorage.getItem(VIEW_MODE_KEY) || "grid";
  updateViewModeUI();
}

function setViewMode(mode) {
  viewMode = mode;
  localStorage.setItem(VIEW_MODE_KEY, mode);
  updateViewModeUI();
}

function updateViewModeUI() {
  if (!portfolioGrid) return;
  if (viewMode === "compact") {
    portfolioGrid.classList.remove("grid-mode");
    portfolioGrid.classList.add("compact-mode");
    if (viewCompactBtn) viewCompactBtn.classList.add("active");
    if (viewGridBtn) viewGridBtn.classList.remove("active");
  } else {
    portfolioGrid.classList.remove("compact-mode");
    portfolioGrid.classList.add("grid-mode");
    if (viewGridBtn) viewGridBtn.classList.add("active");
    if (viewCompactBtn) viewCompactBtn.classList.remove("active");
  }
}

// Persistence
function loadPortfolios() {
  try {
    const masterRaw = localStorage.getItem(STORAGE_KEY);
    if (masterRaw) {
      const parsed = JSON.parse(masterRaw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        portfolios = parsed;
        updateStats();
        return;
      }
    }

    // Default starter list
    portfolios = [...DEFAULT_PORTFOLIOS];
    savePortfolios();
  } catch (err) {
    console.error("Error loading portfolios:", err);
    portfolios = [...DEFAULT_PORTFOLIOS];
    savePortfolios();
  }
}

function savePortfolios() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolios));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
  updateStats();
}

function updateStats() {
  if (statsBadge) {
    const count = portfolios.length;
    statsBadge.textContent = `${count} indexed`;
  }
}

// Helpers
function extractDomain(urlStr) {
  try {
    let clean = (urlStr || "").trim();
    if (!clean) return "";
    if (!/^https?:\/\//i.test(clean)) {
      clean = "https://" + clean;
    }
    const parsed = new URL(clean);
    return parsed.hostname.replace(/^www\./, "");
  } catch (e) {
    return urlStr || "";
  }
}

function sanitizeUrl(urlStr) {
  let clean = (urlStr || "").trim();
  if (!clean) return "";
  if (!/^https?:\/\//i.test(clean)) {
    clean = "https://" + clean;
  }
  return clean;
}

function getBestFavicon(domain, logoUrl) {
  if (logoUrl && typeof logoUrl === "string" && logoUrl.startsWith("http")) {
    return logoUrl;
  }
  return `https://unavatar.io/${domain}?fallback=https://icons.duckduckgo.com/ip3/${domain}.ico`;
}

// Scraper
async function fetchMetadata(targetUrl) {
  const cleanUrl = sanitizeUrl(targetUrl);
  const domain = extractDomain(cleanUrl);

  const fallbackThumbnail = `https://image.thum.io/get/width/800/crop/600/${cleanUrl}`;
  const defaultFavicon = `https://unavatar.io/${domain}?fallback=https://icons.duckduckgo.com/ip3/${domain}.ico`;
  const defaultTitle = domain ? (domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1)) : "Reference";

  try {
    const apiUrl = `https://api.microlink.io?url=${encodeURIComponent(cleanUrl)}`;
    const res = await fetch(apiUrl, { cache: "force-cache" });
    
    if (res.ok) {
      const json = await res.json();
      if (json.status === "success" && json.data) {
        const data = json.data;
        const title = data.title || data.publisher || defaultTitle;
        const description = data.description || "Curated web & UI reference.";
        
        const scrapedIcon = data.logo?.url || data.icon?.url || data.favicon?.url;
        const icon = getBestFavicon(domain, scrapedIcon);
        const image = data.image?.url || fallbackThumbnail;

        return {
          title,
          description,
          icon,
          image,
          domain,
          url: cleanUrl
        };
      }
    }
  } catch (err) {
    console.warn("Metadata error:", err);
  }

  return {
    title: defaultTitle,
    description: "Curated web & UI reference.",
    icon: defaultFavicon,
    image: fallbackThumbnail,
    domain: domain,
    url: cleanUrl
  };
}

// Smart Category Guessing (Portfolios, UI & Components, Inspiration, Tools & Resources)
function guessCategory(meta) {
  const combined = `${meta.title || ""} ${meta.description || ""} ${meta.url || ""} ${meta.domain || ""}`.toLowerCase();
  
  // UI & Components
  if (
    combined.includes("21st.dev") ||
    combined.includes("component") ||
    combined.includes("ui library") ||
    combined.includes("ui kit") ||
    combined.includes("obsidian") ||
    combined.includes("shadcn") ||
    combined.includes("aceternity") ||
    combined.includes("magicui") ||
    combined.includes("uiverse") ||
    combined.includes("tailwind") ||
    combined.includes("elements") ||
    combined.includes("blocks") ||
    combined.includes("buttons") ||
    combined.includes("radix") ||
    combined.includes("lucide") ||
    combined.includes("icons")
  ) {
    return "UI & Components";
  }

  // Tools & Resources
  if (
    combined.includes("tool") ||
    combined.includes("palette") ||
    combined.includes("color") ||
    combined.includes("gradient") ||
    combined.includes("generator") ||
    combined.includes("typography") ||
    combined.includes("font") ||
    combined.includes("resource") ||
    combined.includes("cheatsheet")
  ) {
    return "Tools & Resources";
  }

  // Inspiration & Galleries
  if (
    combined.includes("siteinspire") ||
    combined.includes("awwwards") ||
    combined.includes("land-book") ||
    combined.includes("godly") ||
    combined.includes("gallery") ||
    combined.includes("mobbin") ||
    combined.includes("curation")
  ) {
    return "Inspiration";
  }

  // Default
  return "Portfolios";
}

// Quick Add Handler
async function handleQuickAdd(e) {
  e.preventDefault();
  const url = quickUrlInput.value.trim();
  if (!url) return;

  const btnText = quickSubmitBtn.querySelector(".btn-text");
  const btnLoading = quickSubmitBtn.querySelector(".btn-loading");
  if (btnText) btnText.classList.add("hidden");
  if (btnLoading) btnLoading.classList.remove("hidden");
  quickSubmitBtn.disabled = true;

  try {
    const meta = await fetchMetadata(url);
    const category = guessCategory(meta);

    const initialTags = [category];
    if (category === "UI & Components") initialTags.push("UI Library");
    if (meta.title.toLowerCase().includes("3d") || meta.description.toLowerCase().includes("3d")) initialTags.push("3D / Motion");
    if (meta.title.toLowerCase().includes("minimal") || meta.description.toLowerCase().includes("minimal")) initialTags.push("Minimal");

    const newPortfolio = {
      id: "pf-" + Date.now(),
      url: meta.url,
      title: meta.title,
      domain: meta.domain,
      category,
      description: meta.description,
      image: meta.image,
      icon: meta.icon,
      tags: initialTags,
      pinned: false,
      createdAt: Date.now()
    };

    const existsIndex = portfolios.findIndex(p => p.url.toLowerCase() === meta.url.toLowerCase());
    if (existsIndex !== -1) {
      portfolios[existsIndex] = { ...portfolios[existsIndex], ...newPortfolio, id: portfolios[existsIndex].id };
      savePortfolios();
      showToast(`Refreshed: ${meta.title}`);
    } else {
      portfolios.unshift(newPortfolio);
      savePortfolios();
      showToast(`Added: ${meta.title}`);
    }

    quickUrlInput.value = "";
    render();
  } catch (err) {
    showToast("Error retrieving metadata");
  } finally {
    if (btnText) btnText.classList.remove("hidden");
    if (btnLoading) btnLoading.classList.add("hidden");
    quickSubmitBtn.disabled = false;
    refreshIcons();
  }
}

// Render Engine
function render() {
  updateStats();

  const currentSearch = (searchInput ? searchInput.value.trim() : searchQuery).toLowerCase();

  let filtered = portfolios.filter(item => {
    if (!item) return false;

    if (activeTag === "pinned") {
      if (!item.pinned) return false;
    } else if (activeTag && activeTag.toLowerCase() !== "all") {
      const targetTag = activeTag.toLowerCase();
      const itemCat = (item.category || "").toLowerCase();
      
      const isPortfolioMatch = targetTag === "portfolios" && (itemCat.includes("portfolio") || itemCat === "design" || itemCat === "developer" || itemCat === "engineering");
      const isUiMatch = targetTag === "ui & components" && (itemCat.includes("ui") || itemCat.includes("component") || itemCat.includes("library"));
      const isCategoryMatch = itemCat === targetTag || isPortfolioMatch || isUiMatch;
      const isTagMatch = (item.tags || []).some(t => t.toLowerCase() === targetTag || (targetTag === "ui & components" && (t.toLowerCase().includes("ui") || t.toLowerCase().includes("component"))));

      if (!isCategoryMatch && !isTagMatch) return false;
    }

    if (currentSearch) {
      const titleMatch = (item.title || "").toLowerCase().includes(currentSearch);
      const urlMatch = (item.url || "").toLowerCase().includes(currentSearch);
      const descMatch = (item.description || "").toLowerCase().includes(currentSearch);
      const tagsMatch = (item.tags || []).some(t => t.toLowerCase().includes(currentSearch));
      if (!titleMatch && !urlMatch && !descMatch && !tagsMatch) return false;
    }

    return true;
  });

  filtered.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  if (galleryCountText) {
    galleryCountText.textContent = `${filtered.length} item${filtered.length === 1 ? '' : 's'}`;
  }

  if (filtered.length === 0) {
    if (portfolioGrid) portfolioGrid.innerHTML = "";
    if (emptyState) emptyState.classList.remove("hidden");
  } else {
    if (emptyState) emptyState.classList.add("hidden");
    if (portfolioGrid) {
      portfolioGrid.innerHTML = filtered.map(item => createCardHTML(item)).join("");
    }
  }

  refreshIcons();
}

// Card HTML Template
function createCardHTML(item) {
  const tagsHtml = (item.tags || [])
    .map(t => `<span class="tag-label" onclick="filterByTag('${escapeHtml(t)}')">${escapeHtml(t)}</span>`)
    .join("");

  const domain = item.domain || extractDomain(item.url || "");
  const faviconUrl = item.icon || `https://unavatar.io/${domain}?fallback=https://icons.duckduckgo.com/ip3/${domain}.ico`;
  const imgUrl = item.image || `https://image.thum.io/get/width/800/crop/600/${encodeURIComponent(item.url)}`;

  return `
    <article class="portfolio-card ${item.pinned ? "is-pinned" : ""}" data-id="${item.id}">
      <div class="card-media">
        ${item.pinned ? `
          <span class="card-bookmark-flag">
            <i data-lucide="bookmark"></i>
            <span>Saved</span>
          </span>
        ` : ""}
        <span class="card-category-badge">${escapeHtml(item.category || "Portfolios")}</span>
        <img 
          class="card-img" 
          src="${escapeHtml(imgUrl)}" 
          alt="${escapeHtml(item.title || "Reference")}"
          loading="lazy"
          onerror="this.onerror=null;this.src='https://image.thum.io/get/width/800/crop/600/${encodeURIComponent(item.url)}';"
        >
        <div class="card-media-overlay">
          <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="btn-quick-visit">
            <span>Visit site</span>
            <i data-lucide="arrow-up-right"></i>
          </a>
        </div>
      </div>

      <div class="card-content">
        <div class="card-header-row">
          <img 
            class="card-favicon" 
            src="${escapeHtml(faviconUrl)}" 
            alt=""
            loading="lazy"
            onerror="this.onerror=null;this.src='https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico';"
          >
          <div class="card-meta-text">
            <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="card-title-link" title="${escapeHtml(item.title)}">
              ${escapeHtml(item.title || "Untitled")}
            </a>
            <div class="card-domain-label">
              <span>${escapeHtml(domain)}</span>
            </div>
          </div>
        </div>

        <p class="card-note">${escapeHtml(item.description || "Design & web reference.")}</p>

        <div class="card-tags-row">
          ${tagsHtml}
        </div>
      </div>

      <div class="card-bottom-bar">
        <div class="card-actions-left">
          <button class="btn-icon-action btn-bookmark-action ${item.pinned ? "is-active-saved" : ""}" onclick="togglePin('${item.id}')" title="${item.pinned ? "Remove from saved" : "Save reference"}">
            <i data-lucide="bookmark"></i>
          </button>
          <button class="btn-icon-action" onclick="openEditModal('${item.id}')" title="Edit details">
            <i data-lucide="pencil"></i>
          </button>
          <button class="btn-icon-action" onclick="copyUrl('${escapeHtml(item.url)}')" title="Copy URL">
            <i data-lucide="copy"></i>
          </button>
          <button class="btn-icon-action btn-del" onclick="deletePortfolio('${item.id}')" title="Delete">
            <i data-lucide="trash"></i>
          </button>
        </div>

        <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="direct-open-link">
          <span>Open</span>
          <i data-lucide="external-link"></i>
        </a>
      </div>
    </article>
  `;
}

// Global Operations
window.togglePin = function(id) {
  const item = portfolios.find(p => p.id === id);
  if (item) {
    item.pinned = !item.pinned;
    savePortfolios();
    showToast(item.pinned ? "Saved to top" : "Removed from saved");
    render();
  }
};

window.copyUrl = function(url) {
  navigator.clipboard.writeText(url).then(() => {
    showToast("URL copied");
  }).catch(() => {
    showToast(url);
  });
};

window.filterByTag = function(tag) {
  activeTag = tag;

  // Filter Pills in Controls Bar
  document.querySelectorAll(".filter-pill").forEach(c => {
    if (c.dataset.tag && c.dataset.tag.toLowerCase() === tag.toLowerCase()) {
      c.classList.add("active");
      c.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    } else {
      c.classList.remove("active");
    }
  });

  render();
};

// Modal Operations
function openAddModal() {
  modalTitle.textContent = "Add Reference";
  editId.value = "";
  editUrl.value = "";
  editTitle.value = "";
  editCategory.value = "Portfolios";
  editImage.value = "";
  editDesc.value = "";
  editTags.value = "Portfolios";
  editModal.classList.remove("hidden");
  refreshIcons();
}

window.openEditModal = function(id) {
  const item = portfolios.find(p => p.id === id);
  if (!item) return;

  modalTitle.textContent = "Edit Reference";
  editId.value = item.id;
  editUrl.value = item.url || "";
  editTitle.value = item.title || "";
  editCategory.value = item.category || "Portfolios";
  editImage.value = item.image || "";
  editDesc.value = item.description || "";
  editTags.value = (item.tags || []).join(", ");
  editModal.classList.remove("hidden");
  refreshIcons();
};

function closeModals() {
  const editModalEl = document.getElementById("editModal");
  const backupModalEl = document.getElementById("backupModal");
  const confirmModalEl = document.getElementById("confirmModal");
  const dragOverlayEl = document.getElementById("dragDropOverlay");
  
  if (editModalEl) editModalEl.classList.add("hidden");
  if (backupModalEl) backupModalEl.classList.add("hidden");
  if (confirmModalEl) confirmModalEl.classList.add("hidden");
  if (dragOverlayEl) dragOverlayEl.classList.add("hidden");
  pendingConfirmCallback = null;
}
window.closeModals = closeModals;

async function handleModalRefetch() {
  const url = editUrl.value.trim();
  if (!url) {
    showToast("Enter a URL first");
    return;
  }
  refetchMetaBtn.disabled = true;
  refetchMetaBtn.innerHTML = `<span class="spinner"></span>`;

  try {
    const meta = await fetchMetadata(url);
    editTitle.value = meta.title;
    editDesc.value = meta.description;
    editImage.value = meta.image;
    editCategory.value = guessCategory(meta);
    showToast("Metadata updated");
  } catch (e) {
    showToast("Fetch failed");
  } finally {
    refetchMetaBtn.disabled = false;
    refetchMetaBtn.innerHTML = `<i data-lucide="refresh-cw"></i><span>Fetch</span>`;
    refreshIcons();
  }
}

function handleModalSave(e) {
  e.preventDefault();
  const id = editId.value;
  const url = sanitizeUrl(editUrl.value);
  const domain = extractDomain(url);
  const title = editTitle.value.trim() || domain;
  const category = editCategory.value;
  const image = editImage.value.trim() || `https://image.thum.io/get/width/800/crop/600/${url}`;
  const icon = getBestFavicon(domain);
  const description = editDesc.value.trim();
  const rawTags = editTags.value.split(",").map(t => t.trim()).filter(Boolean);
  const tags = rawTags.length ? rawTags : [category];

  if (id) {
    const index = portfolios.findIndex(p => p.id === id);
    if (index !== -1) {
      portfolios[index] = {
        ...portfolios[index],
        url,
        domain,
        title,
        category,
        image,
        icon: portfolios[index].icon || icon,
        description,
        tags
      };
      showToast("Updated reference");
    }
  } else {
    const newEntry = {
      id: "pf-" + Date.now(),
      url,
      domain,
      title,
      category,
      image,
      icon,
      description,
      tags,
      pinned: false,
      createdAt: Date.now()
    };
    portfolios.unshift(newEntry);
    showToast("Reference added");
  }

  savePortfolios();
  closeModals();
  render();
}

// Paste Handler
async function handleClipboardPaste() {
  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      const text = await navigator.clipboard.readText();
      if (text) {
        quickUrlInput.value = text.trim();
        showToast("Pasted");
        quickUrlInput.focus();
      }
    } else {
      quickUrlInput.focus();
    }
  } catch (err) {
    quickUrlInput.focus();
  }
}

// Backup Operations
function exportCollection() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(portfolios, null, 2));
  const a = document.createElement("a");
  const date = new Date().toISOString().split("T")[0];
  a.setAttribute("href", dataStr);
  a.setAttribute("download", `creafolio-vault-${date}.json`);
  document.body.appendChild(a);
  a.click();
  a.remove();
  showToast("JSON exported");
}

// Custom Theme-Styled Confirmation Dialog
function showConfirmDialog({ title, message, confirmText = "Confirm", isDanger = false, onConfirm }) {
  const confirmModalEl = document.getElementById("confirmModal");
  const confirmTitleEl = document.getElementById("confirmTitle");
  const confirmMessageEl = document.getElementById("confirmMessage");
  const confirmActionBtnEl = document.getElementById("confirmActionBtn");
  const confirmIconWrapEl = document.getElementById("confirmIconWrap");

  if (confirmTitleEl) confirmTitleEl.textContent = title;
  if (confirmMessageEl) confirmMessageEl.textContent = message;
  if (confirmActionBtnEl) {
    confirmActionBtnEl.textContent = confirmText;
    if (isDanger) {
      confirmActionBtnEl.className = "btn btn-danger btn-sm";
    } else {
      confirmActionBtnEl.className = "btn btn-primary btn-sm";
    }
  }

  if (confirmIconWrapEl) {
    if (isDanger) {
      confirmIconWrapEl.className = "confirm-icon-wrap is-danger";
    } else {
      confirmIconWrapEl.className = "confirm-icon-wrap";
    }
  }

  pendingConfirmCallback = onConfirm;
  if (confirmModalEl) confirmModalEl.classList.remove("hidden");
  refreshIcons();
}

window.deletePortfolio = function(id) {
  const item = portfolios.find(p => p.id === id);
  if (!item) return;

  showConfirmDialog({
    title: "Delete Reference",
    message: `Are you sure you want to remove "${item.title}" from your vault?`,
    confirmText: "Delete",
    isDanger: true,
    onConfirm: () => {
      portfolios = portfolios.filter(p => p.id !== id);
      savePortfolios();
      showToast("Item deleted");
      render();
    }
  });
};

function processImportFile(file) {
  if (!file) return;
  if (!file.name.toLowerCase().endsWith(".json") && file.type !== "application/json") {
    showToast("Please select a valid .json file");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const parsed = JSON.parse(event.target.result);
      if (Array.isArray(parsed) && parsed.length > 0) {
        showConfirmDialog({
          title: "Import Collection",
          message: `Import and merge ${parsed.length} reference${parsed.length === 1 ? '' : 's'} into your vault? Existing items will be preserved.`,
          confirmText: "Import",
          isDanger: false,
          onConfirm: () => {
            const map = new Map();
            // Preserve user's current items
            portfolios.forEach(p => {
              if (p && p.url) {
                map.set(p.url.toLowerCase(), p);
              }
            });
            // Merge incoming items
            parsed.forEach(p => {
              if (p && p.url) {
                map.set(p.url.toLowerCase(), {
                  id: p.id || ("pf-" + Date.now() + Math.random().toString(36).substr(2, 4)),
                  url: sanitizeUrl(p.url),
                  domain: p.domain || extractDomain(p.url),
                  title: p.title || extractDomain(p.url),
                  category: p.category || "Portfolios",
                  description: p.description || "Curated reference.",
                  image: p.image || `https://image.thum.io/get/width/800/crop/600/${sanitizeUrl(p.url)}`,
                  icon: p.icon || getBestFavicon(extractDomain(p.url)),
                  tags: Array.isArray(p.tags) && p.tags.length > 0 ? p.tags : [p.category || "Portfolios"],
                  pinned: !!p.pinned,
                  createdAt: p.createdAt || Date.now()
                });
              }
            });
            portfolios = Array.from(map.values());
            savePortfolios();
            showToast(`Imported ${parsed.length} items`);
            closeModals();
            render();
          }
        });
      } else {
        showToast("Invalid or empty collection file");
      }
    } catch (err) {
      console.error("Import parsing error:", err);
      showToast("Error reading JSON file");
    }
  };
  reader.readAsText(file);
}

function handleImportJson(e) {
  if (e.target.files && e.target.files.length > 0) {
    processImportFile(e.target.files[0]);
    e.target.value = "";
  }
}

function resetToDefaults() {
  showConfirmDialog({
    title: "Reset to Defaults",
    message: "Reset your vault back to the default curated starter collection? This will replace your current items.",
    confirmText: "Reset",
    isDanger: true,
    onConfirm: () => {
      portfolios = [...DEFAULT_PORTFOLIOS];
      savePortfolios();
      showToast("Reset to defaults");
      closeModals();
      render();
    }
  });
}

// Toast
function showToast(msg) {
  if (!toastContainer) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<i data-lucide="check"></i><span>${escapeHtml(msg)}</span>`;
  toastContainer.appendChild(toast);
  refreshIcons();

  setTimeout(() => {
    toast.style.transition = "opacity 0.2s ease, transform 0.2s ease";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(6px)";
    setTimeout(() => toast.remove(), 200);
  }, 2200);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

// Event Bindings
function bindEvents() {
  if (quickAddForm) quickAddForm.addEventListener("submit", handleQuickAdd);
  if (pasteClipboardBtn) pasteClipboardBtn.addEventListener("click", handleClipboardPaste);
  if (themeToggleBtn) themeToggleBtn.addEventListener("click", toggleTheme);
  
  if (viewGridBtn) viewGridBtn.addEventListener("click", () => setViewMode("grid"));
  if (viewCompactBtn) viewCompactBtn.addEventListener("click", () => setViewMode("compact"));

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim();
      if (clearSearchBtn) {
        if (searchQuery) {
          clearSearchBtn.classList.remove("hidden");
        } else {
          clearSearchBtn.classList.add("hidden");
        }
      }
      render();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      searchQuery = "";
      clearSearchBtn.classList.add("hidden");
      render();
    });
  }

  // Tag Filters & Smooth Scroll
  const tagsContainer = document.querySelector(".tags-container");
  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;
  let hasDragged = false;

  if (tagsContainer) {
    tagsContainer.addEventListener("mousedown", (e) => {
      isDragging = true;
      hasDragged = false;
      tagsContainer.classList.add("is-dragging");
      startX = e.pageX - tagsContainer.offsetLeft;
      scrollLeft = tagsContainer.scrollLeft;
    });

    tagsContainer.addEventListener("mouseleave", () => {
      isDragging = false;
      tagsContainer.classList.remove("is-dragging");
    });

    tagsContainer.addEventListener("mouseup", () => {
      isDragging = false;
      tagsContainer.classList.remove("is-dragging");
    });

    tagsContainer.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - tagsContainer.offsetLeft;
      const walk = (x - startX) * 1.5;
      if (Math.abs(walk) > 4) {
        hasDragged = true;
      }
      tagsContainer.scrollLeft = scrollLeft - walk;
    });

    tagsContainer.addEventListener("wheel", (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        tagsContainer.scrollLeft += e.deltaY;
      }
    }, { passive: false });
  }

  if (tagFilters) {
    tagFilters.addEventListener("click", (e) => {
      if (hasDragged) {
        hasDragged = false;
        return;
      }
      const btn = e.target.closest(".filter-pill");
      if (!btn) return;
      document.querySelectorAll(".filter-pill").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      activeTag = btn.dataset.tag;
      render();
    });
  }

  // Resizable Navbar Scroll Morphing (Fixed & Always Visible)
  const mainNavbar = document.getElementById("mainNavbar");
  if (mainNavbar) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 40) {
        mainNavbar.classList.add("is-scrolled");
      } else {
        mainNavbar.classList.remove("is-scrolled");
      }
    }, { passive: true });
  }

  if (openAddModalBtn) openAddModalBtn.addEventListener("click", openAddModal);
  if (mobileFabBtn) mobileFabBtn.addEventListener("click", openAddModal);
  if (emptyAddBtn) emptyAddBtn.addEventListener("click", openAddModal);

  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModals);
  if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeModals);
  if (editForm) editForm.addEventListener("submit", handleModalSave);
  if (refetchMetaBtn) refetchMetaBtn.addEventListener("click", handleModalRefetch);

  if (backupModalBtn) backupModalBtn.addEventListener("click", () => {
    if (backupModal) backupModal.classList.remove("hidden");
    refreshIcons();
  });
  if (closeBackupModalBtn) closeBackupModalBtn.addEventListener("click", closeModals);
  if (exportJsonBtn) exportJsonBtn.addEventListener("click", exportCollection);
  if (importJsonInput) importJsonInput.addEventListener("change", handleImportJson);
  if (resetDefaultsBtn) resetDefaultsBtn.addEventListener("click", resetToDefaults);

  // Drag and Drop Import Handlers
  const dragOverlay = document.getElementById("dragDropOverlay");
  const importDropzone = document.getElementById("importDropzone");
  let dragCounter = 0;

  // Global Window Drag & Drop
  window.addEventListener("dragenter", (e) => {
    e.preventDefault();
    dragCounter++;
    if (dragOverlay) {
      dragOverlay.classList.remove("hidden");
      refreshIcons();
    }
  });

  window.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "copy";
    }
  });

  window.addEventListener("dragleave", (e) => {
    e.preventDefault();
    dragCounter--;
    if (dragCounter <= 0) {
      dragCounter = 0;
      if (dragOverlay) {
        dragOverlay.classList.add("hidden");
      }
    }
  });

  window.addEventListener("drop", (e) => {
    e.preventDefault();
    dragCounter = 0;
    if (dragOverlay) {
      dragOverlay.classList.add("hidden");
    }

    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processImportFile(file);
    }
  });

  // Modal Dropzone specific highlight
  if (importDropzone) {
    importDropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      importDropzone.classList.add("dragover");
    });
    importDropzone.addEventListener("dragleave", () => {
      importDropzone.classList.remove("dragover");
    });
    importDropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      importDropzone.classList.remove("dragover");
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processImportFile(e.dataTransfer.files[0]);
      }
    });
  }

  // Confirmation Dialog Actions
  const confirmCancelBtn = document.getElementById("confirmCancelBtn");
  const confirmActionBtn = document.getElementById("confirmActionBtn");
  const confirmModal = document.getElementById("confirmModal");

  if (confirmCancelBtn) {
    confirmCancelBtn.addEventListener("click", closeModals);
  }

  if (confirmActionBtn) {
    confirmActionBtn.addEventListener("click", () => {
      if (typeof pendingConfirmCallback === "function") {
        const cb = pendingConfirmCallback;
        closeModals();
        cb();
      } else {
        closeModals();
      }
    });
  }

  // Click Outside to Dismiss Modals
  window.addEventListener("click", (e) => {
    if (e.target === editModal || e.target === backupModal || e.target === confirmModal || e.target === dragOverlay) {
      closeModals();
    }
  });

  // Keyboard Shortcuts (Esc to close, Enter to confirm, Cmd+D for theme)
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModals();
    }
    if (e.key === "Enter" && confirmModal && !confirmModal.classList.contains("hidden")) {
      e.preventDefault();
      if (typeof pendingConfirmCallback === "function") {
        const cb = pendingConfirmCallback;
        closeModals();
        cb();
      }
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "d") {
      e.preventDefault();
      toggleTheme();
    }
  });
}

// Automatic Initialization
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
