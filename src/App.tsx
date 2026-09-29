import React, { useState, useEffect, useCallback } from "react";
import { PortfolioItem, ViewMode } from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  fetchPublishedPortfolios,
  fetchAdminPortfolios,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  DEFAULT_PORTFOLIOS,
} from "@/lib/portfolio-service";

import KineticGrid from "@/components/ui/kinetic-grid";
import { Navbar, NavBody } from "@/components/ui/resizable-navbar";
import { BrandLogo } from "@/components/BrandLogo";
import { ControlsBar } from "@/components/ControlsBar";
import { PortfolioCard } from "@/components/PortfolioCard";
import { PortfolioListItem } from "@/components/PortfolioListItem";
import { EditModal } from "@/components/EditModal";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Toast } from "@/components/Toast";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

import {
  Sun,
  Moon,
  Grid,
  List,
  Inbox,
  Shield,
  Loader2,
  Lock,
} from "lucide-react";

const THEME_KEY = "creafolio_theme_master";

export function App() {
  // Navigation / View route
  const [currentRoute, setCurrentRoute] = useState<"public" | "admin">(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash.includes("admin") || path === "/admin") {
        return "admin";
      }
    }
    return "public";
  });

  // Auth state
  const [adminUser, setAdminUser] = useState<{ email: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Data state
  const [publicPortfolios, setPublicPortfolios] = useState<PortfolioItem[]>([]);
  const [adminPortfolios, setAdminPortfolios] = useState<PortfolioItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Filter & layout state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [theme, setTheme] = useState("dark");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
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

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  // Sync route with URL hash & popstate
  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash.includes("admin") || path === "/admin") {
        setCurrentRoute("admin");
      } else {
        setCurrentRoute("public");
      }
    };

    window.addEventListener("hashchange", handleLocationChange);
    window.addEventListener("popstate", handleLocationChange);
    return () => {
      window.removeEventListener("hashchange", handleLocationChange);
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  const navigateTo = (route: "public" | "admin") => {
    setCurrentRoute(route);
    if (route === "admin") {
      window.location.hash = "#admin";
    } else {
      if (window.location.hash.includes("admin")) {
        window.location.hash = "";
      }
    }
  };

  // Initialize Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) || "dark";
    setTheme(savedTheme);
    document.body.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.body.setAttribute("data-theme", next);
    localStorage.setItem(THEME_KEY, next);
    showToast(`Theme: ${next}`);
  };

  // Supabase Auth listener
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setAuthLoading(false);
      return;
    }

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setAdminUser({ email: session.user.email });
      } else {
        setAdminUser(null);
      }
      setAuthLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setAdminUser({ email: session.user.email });
      } else {
        setAdminUser(null);
      }
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch Public Portfolios
  const loadPublicData = useCallback(async () => {
    setDataLoading(true);
    try {
      const data = await fetchPublishedPortfolios();
      setPublicPortfolios(data);
    } catch {
      setPublicPortfolios(DEFAULT_PORTFOLIOS);
    } finally {
      setDataLoading(false);
    }
  }, []);

  // Fetch Admin Portfolios
  const loadAdminData = useCallback(async () => {
    setDataLoading(true);
    try {
      const data = await fetchAdminPortfolios();
      setAdminPortfolios(data);
    } catch {
      setAdminPortfolios(DEFAULT_PORTFOLIOS);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPublicData();
  }, [loadPublicData]);

  useEffect(() => {
    if (adminUser) {
      loadAdminData();
    }
  }, [adminUser, loadAdminData]);

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
    const defaultTitle = domain
      ? domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1)
      : "Reference";

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
    } else if (clean.includes("tool") || clean.includes("generator") || clean.includes("color")) {
      guessedCat = "Tools & Resources";
    }

    try {
      const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(clean)}`, {
        cache: "force-cache",
      });
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
      // Fallback
    }

    return {
      title: defaultTitle,
      description: "Curated web & UI reference.",
      image: fallbackThumbnail,
      category: guessedCat,
    };
  };

  // Sign out handler
  const handleSignOut = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setAdminUser(null);
    showToast("Signed out of admin session");
    navigateTo("public");
  };

  // Admin save item handler
  const handleSaveModalItem = async (data: Partial<PortfolioItem>) => {
    try {
      if (data.id) {
        await updatePortfolio(data.id, data);
        showToast("Updated reference");
      } else {
        await createPortfolio(data);
        showToast("Created reference");
      }
      await loadAdminData();
      await loadPublicData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving portfolio";
      showToast(msg);
    }
  };

  // Admin delete handler
  const handleDeleteItem = (item: PortfolioItem) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Reference",
      message: `Permanently delete "${item.title}" from the database?`,
      confirmText: "Delete",
      isDanger: true,
      onConfirm: async () => {
        try {
          await deletePortfolio(item.id);
          await loadAdminData();
          await loadPublicData();
          showToast("Item deleted");
        } catch {
          showToast("Failed to delete item");
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast("URL copied to clipboard");
  };

  // Filtering for public view
  const filteredPublicPortfolios = publicPortfolios.filter((item) => {
    if (activeTag === "pinned") {
      if (!item.pinned) return false;
    } else if (activeTag && activeTag !== "all") {
      const target = activeTag.toLowerCase();
      const cat = (item.category || "").toLowerCase();
      const isPortfolio =
        target === "portfolios" &&
        (cat.includes("portfolio") || cat.includes("design") || cat.includes("developer"));
      const isUi =
        target === "ui & components" &&
        (cat.includes("ui") || cat.includes("component") || cat.includes("library"));
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

  return (
    <KineticGrid globalColor="monochrome">
      {/* Resizable Floating Navbar */}
      <Navbar>
        <NavBody>
          <div
            onClick={() => navigateTo("public")}
            className="cursor-pointer transition hover:opacity-90"
          >
            <BrandLogo count={publicPortfolios.length} />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              title="Toggle theme (⌘D)"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-zinc-400 transition hover:border-white/10 hover:bg-zinc-800 hover:text-white"
            >
              {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            {/* Portal navigation pill */}
            {adminUser ? (
              <button
                type="button"
                onClick={() =>
                  navigateTo(currentRoute === "admin" ? "public" : "admin")
                }
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-900/40"
              >
                <Shield className="h-3.5 w-3.5" />
                <span>{currentRoute === "admin" ? "Public View" : "Admin Panel"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigateTo("admin")}
                title="Owner Login"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-zinc-500 transition hover:border-white/10 hover:bg-zinc-800 hover:text-zinc-300"
              >
                <Lock className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </NavBody>
      </Navbar>

      {/* Main Container */}
      {currentRoute === "admin" ? (
        authLoading ? (
          <div className="flex min-h-[60vh] items-center justify-center pt-24">
            <Loader2 className="h-7 w-7 animate-spin text-zinc-500" />
          </div>
        ) : adminUser ? (
          <AdminDashboard
            adminEmail={adminUser.email}
            items={adminPortfolios}
            onRefreshData={loadAdminData}
            onSignOut={handleSignOut}
            onBackToPublic={() => navigateTo("public")}
            onOpenEdit={(item) => {
              setEditingItem(item);
              setIsEditOpen(true);
            }}
            onConfirmDelete={handleDeleteItem}
            onShowToast={showToast}
            fetchMetadata={fetchMetadata}
          />
        ) : (
          <AdminLogin
            onLoginSuccess={(email) => {
              setAdminUser({ email });
              showToast(`Welcome back, ${email}`);
            }}
            onBackToPublic={() => navigateTo("public")}
          />
        )
      ) : (
        /* Public Browsing Experience */
        <main className="mx-auto w-full max-w-[1140px] px-4 pt-20 pb-20 sm:px-6">
          {/* Hero Header */}
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Curated Design & Portfolio Vault
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-zinc-400">
              An owner-curated index of inspiring portfolios, creative engineering, and UI libraries.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <ControlsBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeTag={activeTag}
            onTagSelect={setActiveTag}
          />

          {/* Toolbar: Count & View Switcher */}
          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-xs text-zinc-500">
              {filteredPublicPortfolios.length} reference
              {filteredPublicPortfolios.length === 1 ? "" : "s"}
            </span>
            <div className="flex items-center rounded-md border border-white/10 bg-zinc-900/60 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Grid layout"
                className={`rounded p-1 transition ${
                  viewMode === "grid"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Grid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("compact")}
                title="List layout"
                className={`rounded p-1 transition ${
                  viewMode === "compact"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Card Grid / List */}
          {dataLoading ? (
            <div className="flex min-h-[30vh] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
            </div>
          ) : filteredPublicPortfolios.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-zinc-500">
                <Inbox className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-200">No references found</h3>
              <p className="mt-1 text-xs text-zinc-500">
                Try adjusting your search query or selected category.
              </p>
            </div>
          ) : viewMode === "compact" ? (
            <div className="flex flex-col gap-2.5">
              {filteredPublicPortfolios.map((item) => (
                <PortfolioListItem
                  key={item.id}
                  item={item}
                  isAdmin={false}
                  onCopyUrl={handleCopyUrl}
                  onFilterByTag={setActiveTag}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {filteredPublicPortfolios.map((item) => (
                <PortfolioCard
                  key={item.id}
                  item={item}
                  isAdmin={false}
                  onCopyUrl={handleCopyUrl}
                  onFilterByTag={setActiveTag}
                />
              ))}
            </div>
          )}

          {/* Public Footer */}
          <footer className="mt-16 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-zinc-500 sm:flex-row">
            <div>© {new Date().getFullYear()} Creafolio — All rights reserved.</div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigateTo("admin")}
                className="text-zinc-500 hover:text-zinc-300 transition"
              >
                Owner Portal
              </button>
            </div>
          </footer>
        </main>
      )}

      {/* Admin Modals */}
      <EditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveModalItem}
        editingItem={editingItem}
        onFetchMeta={fetchMetadata}
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

      {/* Global Toast */}
      <Toast message={toastMessage} />
    </KineticGrid>
  );
}
