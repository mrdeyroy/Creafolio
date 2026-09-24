import React, { useState, useEffect } from "react";
import { PortfolioItem } from "@/types";
import KineticGrid from "@/components/ui/kinetic-grid";
import { Navbar, NavBody } from "@/components/ui/resizable-navbar";
import { BrandLogo } from "@/components/BrandLogo";
import { Omnibar } from "@/components/Omnibar";
import { ControlsBar } from "@/components/ControlsBar";
import { PortfolioCard } from "@/components/PortfolioCard";
import { PortfolioListItem } from "@/components/PortfolioListItem";
import { EditModal } from "@/components/EditModal";
import { BackupModal } from "@/components/BackupModal";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Toast } from "@/components/Toast";
import { Sun, Moon, Database, Plus, Grid, List, Inbox, UploadCloud } from "lucide-react";

const STORAGE_KEY = "creafolio_vault_v2";
const LEGACY_STORAGE_KEY = "creafolio_vault_master";
const THEME_KEY = "creafolio_theme_master";

const DEFAULT_PORTFOLIOS: PortfolioItem[] = [
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
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
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
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
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
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
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
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
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
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
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
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
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
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
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
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
  },
];

// Deduplicate helper: guarantees zero duplicate items by normalized URL and ID
function deduplicateItems(items: PortfolioItem[]): PortfolioItem[] {
  const seenUrls = new Set<string>();
  const seenIds = new Set<string>();
  const result: PortfolioItem[] = [];

  for (const item of items) {
    if (!item || !item.url) continue;
    const normUrl = item.url.trim().toLowerCase().replace(/\/+$/, "");
    const id = item.id || `pf-${normUrl}`;

    if (!seenUrls.has(normUrl) && !seenIds.has(id)) {
      seenUrls.add(normUrl);
      seenIds.add(id);
      result.push({
        ...item,
        id,
        url: item.url.trim(),
      });
    }
  }
  return result;
}

export function App() {
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");
  const [theme, setTheme] = useState("dark");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Initialize and sanitize cache
  useEffect(() => {
    // Theme
    const savedTheme = localStorage.getItem(THEME_KEY) || "dark";
    setTheme(savedTheme);
    document.body.setAttribute("data-theme", savedTheme);

    // Clean & load Items from new or legacy cache
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = deduplicateItems(parsed);
          setPortfolios(cleaned);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
          localStorage.removeItem(LEGACY_STORAGE_KEY);
          return;
        }
      }
      const initial = deduplicateItems(DEFAULT_PORTFOLIOS);
      setPortfolios(initial);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    } catch {
      const initial = deduplicateItems(DEFAULT_PORTFOLIOS);
      setPortfolios(initial);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    }
  }, []);

  // Save changes with deduplication guarantee
  const updatePortfolios = (
    updater: PortfolioItem[] | ((prev: PortfolioItem[]) => PortfolioItem[])
  ) => {
    setPortfolios((prev) => {
      const nextRaw = typeof updater === "function" ? updater(prev) : updater;
      const deduplicated = deduplicateItems(nextRaw);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deduplicated));
      return deduplicated;
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2300);
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.body.setAttribute("data-theme", next);
    localStorage.setItem(THEME_KEY, next);
    showToast(`Theme: ${next}`);
  };

  // Scraper helper
  const fetchMetadata = async (rawUrl: string) => {
    let clean = rawUrl.trim();
    if (!/^https?:\/\//i.test(clean)) clean = "https://" + clean;
    let domain = "";
    try {
      domain = new URL(clean).hostname.replace(/^www\./, "");
    } catch {
      domain = clean;
    }

    const fallbackThumbnail = `https://image.thum.io/get/width/800/crop/600/${clean}`;
    const defaultTitle = domain ? domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1) : "Reference";

    let guessedCat = "Portfolios";
    if (
      clean.includes("21st.dev") ||
      clean.includes("component") ||
      clean.includes("ui") ||
      clean.includes("shadcn") ||
      clean.includes("aceternity") ||
      clean.includes("magicui")
    ) {
      guessedCat = "UI & Components";
    }

    try {
      const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(clean)}`, { cache: "force-cache" });
      if (res.ok) {
        const json = await res.json();
        if (json.status === "success" && json.data) {
          const d = json.data;
          return {
            title: d.title || d.publisher || defaultTitle,
            description: d.description || "Curated web & UI reference.",
            image: d.image?.url || fallbackThumbnail,
            category: guessedCat,
          };
        }
      }
    } catch {
      // Ignore fetch error
    }

    return {
      title: defaultTitle,
      description: "Curated web & UI reference.",
      image: fallbackThumbnail,
      category: guessedCat,
    };
  };

  // Quick Add handler
  const handleAddUrl = async (rawUrl: string) => {
    let clean = rawUrl.trim();
    if (!/^https?:\/\//i.test(clean)) clean = "https://" + clean;
    let domain = "";
    try {
      domain = new URL(clean).hostname.replace(/^www\./, "");
    } catch {
      domain = clean;
    }

    const meta = await fetchMetadata(clean);

    updatePortfolios((prev) => {
      const normClean = clean.toLowerCase().replace(/\/+$/, "");
      const existsIdx = prev.findIndex((p) => p.url.toLowerCase().replace(/\/+$/, "") === normClean);

      if (existsIdx !== -1) {
        const updated = [...prev];
        updated[existsIdx] = {
          ...updated[existsIdx],
          title: meta.title,
          category: meta.category,
          description: meta.description,
          image: meta.image,
          domain,
        };
        showToast(`Refreshed: ${meta.title}`);
        return updated;
      } else {
        const newItem: PortfolioItem = {
          id: "pf-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
          url: clean,
          title: meta.title,
          domain,
          category: meta.category,
          description: meta.description,
          image: meta.image,
          icon: `https://unavatar.io/${domain}?fallback=https://icons.duckduckgo.com/ip3/${domain}.ico`,
          tags: [meta.category],
          pinned: false,
          createdAt: Date.now(),
        };
        showToast(`Added: ${meta.title}`);
        return [newItem, ...prev];
      }
    });
  };

  // Toggle bookmark with state guarantee
  const handleTogglePin = (id: string) => {
    updatePortfolios((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) {
        showToast(!target.pinned ? "Saved to bookmarks" : "Removed from bookmarks");
      }
      return prev.map((p) => (p.id === id ? { ...p, pinned: !p.pinned } : p));
    });
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast("URL copied to clipboard");
  };

  const handleDelete = (item: PortfolioItem) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Reference",
      message: `Are you sure you want to remove "${item.title}" from your vault?`,
      confirmText: "Delete",
      isDanger: true,
      onConfirm: () => {
        updatePortfolios((prev) =>
          prev.filter((p) => p.id !== item.id && p.url.toLowerCase() !== item.url.toLowerCase())
        );
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast("Item deleted");
      },
    });
  };

  const handleSaveModalItem = (data: Partial<PortfolioItem>) => {
    if (data.id) {
      updatePortfolios((prev) =>
        prev.map((p) => (p.id === data.id ? { ...p, ...data } : p))
      );
      showToast("Updated reference");
    } else if (data.url) {
      handleAddUrl(data.url);
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(portfolios, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `creafolio_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    showToast("Exported backup file");
  };

  const processImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setConfirmModal({
            isOpen: true,
            title: "Import References",
            message: `Merge ${parsed.length} references into your current collection?`,
            confirmText: "Merge & Import",
            onConfirm: () => {
              updatePortfolios((prev) => [...parsed, ...prev]);
              setIsBackupOpen(false);
              setConfirmModal((prev) => ({ ...prev, isOpen: false }));
              showToast(`Imported ${parsed.length} references`);
            },
          });
        }
      } catch {
        showToast("Error reading JSON file");
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    setConfirmModal({
      isOpen: true,
      title: "Reset to Defaults",
      message: "Clear cache and reset your vault back to default references?",
      confirmText: "Reset Cache",
      isDanger: true,
      onConfirm: () => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        const initial = deduplicateItems(DEFAULT_PORTFOLIOS);
        setPortfolios(initial);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        setIsBackupOpen(false);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast("Cache cleared & restored to defaults");
      },
    });
  };

  // Drag-and-drop file listener
  useEffect(() => {
    const onDragOver = (e: DragEvent) => e.preventDefault();
    const onDragEnter = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.types.includes("Files")) setIsDraggingFile(true);
    };
    const onDragLeave = (e: DragEvent) => {
      if (e.clientX === 0 || e.clientY === 0) setIsDraggingFile(false);
    };
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDraggingFile(false);
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        processImportFile(e.dataTransfer.files[0]);
      }
    };

    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);

    return () => {
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, []);

  // Filtering
  const filteredPortfolios = portfolios.filter((item) => {
    if (activeTag === "pinned") {
      if (!item.pinned) return false;
    } else if (activeTag && activeTag !== "all") {
      const target = activeTag.toLowerCase();
      const cat = (item.category || "").toLowerCase();
      const isPortfolio = target === "portfolios" && (cat.includes("portfolio") || cat.includes("design") || cat.includes("developer"));
      const isUi = target === "ui & components" && (cat.includes("ui") || cat.includes("component") || cat.includes("library"));
      const catMatch = cat === target || isPortfolio || isUi;
      const tagMatch = (item.tags || []).some((t) => t.toLowerCase() === target);
      if (!catMatch && !tagMatch) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = (item.title || "").toLowerCase().includes(q);
      const urlMatch = (item.url || "").toLowerCase().includes(q);
      const descMatch = (item.description || "").toLowerCase().includes(q);
      const tagMatch = (item.tags || []).some((t) => t.toLowerCase().includes(q));
      if (!titleMatch && !urlMatch && !descMatch && !tagMatch) return false;
    }

    return true;
  });

  filteredPortfolios.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  return (
    <KineticGrid globalColor="monochrome">
      {/* Resizable Floating Navbar */}
      <Navbar>
        <NavBody>
          <BrandLogo count={portfolios.length} />
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleTheme}
              title="Toggle theme (⌘D)"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-zinc-400 transition hover:border-white/10 hover:bg-zinc-800 hover:text-white"
            >
              {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setIsBackupOpen(true)}
              title="Sync & Backup"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-zinc-400 transition hover:border-white/10 hover:bg-zinc-800 hover:text-white"
            >
              <Database className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingItem(null);
                setIsEditOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-950 transition hover:bg-white"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add link</span>
            </button>
          </div>
        </NavBody>
      </Navbar>

      {/* Main Page Content */}
      <main className="mx-auto w-full max-w-[1140px] px-4 pt-20 pb-20 sm:px-6">
        <Omnibar onAddUrl={handleAddUrl} onShowToast={showToast} />

        <ControlsBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeTag={activeTag}
          onTagSelect={setActiveTag}
        />

        {/* Toolbar: Count & View switcher */}
        <div className="mb-4 flex items-center justify-between">
          <span className="font-mono text-xs text-zinc-500">
            {filteredPortfolios.length} item{filteredPortfolios.length === 1 ? "" : "s"}
          </span>
          <div className="flex items-center rounded-md border border-white/10 bg-zinc-900/60 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`rounded p-1 transition ${
                viewMode === "grid" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("compact")}
              className={`rounded p-1 transition ${
                viewMode === "compact" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Card Grid / List */}
        {filteredPortfolios.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-zinc-500">
              <Inbox className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200">No references found</h3>
            <p className="mt-1 text-xs text-zinc-500">Paste a link above or clear search filters to view items.</p>
          </div>
        ) : viewMode === "compact" ? (
          <div className="flex flex-col gap-2.5">
            {filteredPortfolios.map((item) => (
              <PortfolioListItem
                key={item.id}
                item={item}
                onTogglePin={handleTogglePin}
                onOpenEdit={(itemToEdit) => {
                  setEditingItem(itemToEdit);
                  setIsEditOpen(true);
                }}
                onCopyUrl={handleCopyUrl}
                onDelete={handleDelete}
                onFilterByTag={setActiveTag}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {filteredPortfolios.map((item) => (
              <PortfolioCard
                key={item.id}
                item={item}
                onTogglePin={handleTogglePin}
                onOpenEdit={(itemToEdit) => {
                  setEditingItem(itemToEdit);
                  setIsEditOpen(true);
                }}
                onCopyUrl={handleCopyUrl}
                onDelete={handleDelete}
                onFilterByTag={setActiveTag}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals & Dialogs */}
      <EditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveModalItem}
        editingItem={editingItem}
        onFetchMeta={fetchMetadata}
      />

      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onExport={handleExportJson}
        onImportFile={processImportFile}
        onResetDefaults={handleResetDefaults}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDanger={confirmModal.isDanger}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Global Drag & Drop Overlay */}
      {isDraggingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-md">
          <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-white/30 bg-zinc-900 p-10 text-center shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-zinc-800 text-white">
              <UploadCloud className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-white">Drop JSON to import</h3>
            <p className="text-xs text-zinc-400">Release to merge your portfolio collection</p>
          </div>
        </div>
      )}

      {/* Toast */}
      <Toast message={toastMessage} />
    </KineticGrid>
  );
}
