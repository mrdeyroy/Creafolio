import React, { useState, useEffect, useCallback, useMemo } from "react";
import { PortfolioItem, Collection, ViewMode } from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  fetchPublishedPortfolios,
  fetchAdminPortfolios,
  fetchCollections,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  guessCollections,
  DEFAULT_PORTFOLIOS,
  DEFAULT_COLLECTIONS,
} from "@/lib/portfolio-service";
import { validateAndSanitizeUrl } from "@/lib/url-security";

import KineticGrid from "@/components/ui/kinetic-grid";
import { Navbar, NavBody } from "@/components/ui/resizable-navbar";
import { BrandLogo } from "@/components/BrandLogo";
import { ControlsBar, SortOption } from "@/components/ControlsBar";
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
  Bookmark,
  RotateCcw,
} from "lucide-react";

const THEME_KEY = "creafolio_theme_master";
const FAVORITES_KEY = "creafolio_visitor_favorites";

const getInitialUrlFilters = () => {
  if (typeof window === "undefined") {
    return {
      q: "",
      collections: [] as string[],
      tags: [] as string[],
      sortBy: "default" as SortOption,
      saved: false,
    };
  }
  try {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || "";
    const colParam = params.get("collections") || params.get("collection") || "";
    const collections = colParam
      ? colParam
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean)
      : [];
    const tagParam = params.get("tags") || params.get("tag") || "";
    const tags = tagParam
      ? tagParam
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)
      : [];
    const sortParam = params.get("sort");
    const sortBy: SortOption =
      sortParam === "recent" || sortParam === "alpha" || sortParam === "featured"
        ? sortParam
        : "default";
    const saved = params.get("saved") === "true";

    return { q, collections, tags, sortBy, saved };
  } catch {
    return {
      q: "",
      collections: [] as string[],
      tags: [] as string[],
      sortBy: "default" as SortOption,
      saved: false,
    };
  }
};

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
  const [collections, setCollections] = useState<Collection[]>(DEFAULT_COLLECTIONS);
  const [dataLoading, setDataLoading] = useState(true);

  // Visitor favorites (stored in localStorage without requiring account)
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(FAVORITES_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {
        // Fallback
      }
    }
    return [];
  });

  // Filter & layout state
  const initialFilters = useMemo(() => getInitialUrlFilters(), []);
  const [searchQuery, setSearchQuery] = useState(initialFilters.q);
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    initialFilters.collections
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(initialFilters.tags);
  const [sortBy, setSortBy] = useState<SortOption>(initialFilters.sortBy);
  const [showSavedOnly, setShowSavedOnly] = useState(initialFilters.saved);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [theme, setTheme] = useState("dark");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter handlers
  const handleToggleCollection = useCallback((slug: string) => {
    setSelectedCollections((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }, []);

  const handleSelectAllCollections = useCallback(() => {
    setSelectedCollections(collections.map((c) => c.slug));
  }, [collections]);

  const handleClearCollections = useCallback(() => {
    setSelectedCollections([]);
  }, []);

  const handleToggleTag = useCallback(
    (tag: string) => {
      const clean = tag.trim().toLowerCase();
      // If clicked tag matches a collection name or slug, toggle collection
      const matchingCol = collections.find(
        (c) => c.slug.toLowerCase() === clean || c.name.toLowerCase() === clean
      );
      if (matchingCol) {
        setSelectedCollections((prev) =>
          prev.includes(matchingCol.slug)
            ? prev.filter((s) => s !== matchingCol.slug)
            : [...prev, matchingCol.slug]
        );
      } else {
        setSelectedTags((prev) =>
          prev.includes(clean) ? prev.filter((t) => t !== clean) : [...prev, clean]
        );
      }
    },
    [collections]
  );

  const handleClearTags = useCallback(() => {
    setSelectedTags([]);
  }, []);

  const handleToggleSaved = useCallback(() => {
    setShowSavedOnly((prev) => !prev);
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCollections([]);
    setSelectedTags([]);
    setSortBy("default");
    setShowSavedOnly(false);
  }, []);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedCollections.length > 0 ||
    selectedTags.length > 0 ||
    sortBy !== "default" ||
    showSavedOnly;

  // Sync filter state with URL search params
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (currentRoute !== "public") return;

    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (selectedCollections.length > 0)
      params.set("collections", selectedCollections.join(","));
    if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));
    if (sortBy !== "default") params.set("sort", sortBy);
    if (showSavedOnly) params.set("saved", "true");

    const queryStr = params.toString();
    const newUrl = queryStr
      ? `${window.location.pathname}?${queryStr}${window.location.hash}`
      : `${window.location.pathname}${window.location.hash}`;

    window.history.replaceState(null, "", newUrl);
  }, [
    searchQuery,
    selectedCollections,
    selectedTags,
    sortBy,
    showSavedOnly,
    currentRoute,
  ]);

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

  // Fetch Collections
  const loadCollections = useCallback(async () => {
    try {
      const cols = await fetchCollections();
      setCollections(cols);
    } catch {
      setCollections(DEFAULT_COLLECTIONS);
    }
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

  // Initial load
  useEffect(() => {
    loadCollections();
    loadPublicData();
  }, [loadCollections, loadPublicData]);

  useEffect(() => {
    if (adminUser) {
      loadAdminData();
    }
  }, [adminUser, loadAdminData]);

  // Scraper helper with timeout, SSRF protection, and graceful fallback
  const fetchMetadata = async (rawUrl: string) => {
    const validated = validateAndSanitizeUrl(rawUrl);
    if (!validated.isValid || !validated.sanitizedUrl) {
      throw new Error(validated.error || "Please enter a valid website address.");
    }

    const clean = validated.sanitizedUrl;
    const domain = validated.domain || "reference";
    const defaultTitle = domain
      ? domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1)
      : "Reference";
    const fallbackThumbnail = `https://image.thum.io/get/width/800/crop/600/${encodeURIComponent(clean)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout prevents slow external endpoints from hanging

    try {
      const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(clean)}`, {
        signal: controller.signal,
        cache: "force-cache",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.status === "success" && json.data) {
          const d = json.data;
          const guessedCols = guessCollections(clean, d.title || defaultTitle, d.description);
          const detectedVideo =
            d.video?.url || (typeof d.video === "string" ? d.video : undefined);

          return {
            title: d.title || d.publisher || defaultTitle,
            description: d.description || "Curated web & UI reference.",
            image: d.image?.url || fallbackThumbnail,
            video: detectedVideo,
            guessedCollections: guessedCols,
            category: guessedCols[0] || "Portfolios",
          };
        }
      }
    } catch {
      // Graceful fallback: external service failures or slow networks never break Creafolio
    } finally {
      clearTimeout(timeoutId);
    }

    const guessedCols = guessCollections(clean, defaultTitle);
    return {
      title: defaultTitle,
      description: "Curated web & UI reference.",
      image: fallbackThumbnail,
      video: undefined,
      guessedCollections: guessedCols,
      category: guessedCols[0] || "Portfolios",
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

  // Admin save item handler (supports collection associations)
  const handleSaveModalItem = async (
    data: Partial<PortfolioItem>,
    collectionIds: string[]
  ) => {
    try {
      if (data.id) {
        await updatePortfolio(data.id, data, collectionIds);
        showToast("Updated reference");
      } else {
        await createPortfolio(data, collectionIds);
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

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      let next: string[];
      if (prev.includes(id)) {
        next = prev.filter((item) => item !== id);
        showToast("Removed from saved bookmarks");
      } else {
        next = [...prev, id];
        showToast("Saved to your bookmarks");
      }
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      } catch {
        // Storage full or disabled
      }
      return next;
    });
  };

  const handleClearFavorites = () => {
    setConfirmModal({
      isOpen: true,
      title: "Clear Saved Bookmarks",
      message: "Are you sure you want to remove all saved items from your personal bookmarks?",
      confirmText: "Clear all",
      isDanger: true,
      onConfirm: () => {
        setFavorites([]);
        try {
          localStorage.removeItem(FAVORITES_KEY);
        } catch {
          // ignore
        }
        showToast("Cleared all saved bookmarks");
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Filtering and sorting for public view by collections, tags, saved, and search query
  const filteredPublicPortfolios = useMemo(() => {
    let result = publicPortfolios.filter((item) => {
      // 1. Saved bookmarks filter
      if (showSavedOnly) {
        if (!favorites.includes(item.id)) return false;
      }

      // 2. Collections filter (multi-select: matches any selected collection)
      if (selectedCollections.length > 0) {
        const itemColSlugs = (item.collections || []).map((c) =>
          c.slug.toLowerCase()
        );
        const hasMatchingCol = selectedCollections.some((sel) =>
          itemColSlugs.includes(sel.toLowerCase())
        );
        if (!hasMatchingCol) return false;
      }

      // 3. Tags filter (multi-select: matches any selected tag)
      if (selectedTags.length > 0) {
        const itemTags = (item.tags || []).map((t) => t.toLowerCase());
        const hasMatchingTag = selectedTags.some((sel) =>
          itemTags.includes(sel.toLowerCase())
        );
        if (!hasMatchingTag) return false;
      }

      // 4. Search query (matches title, domain, description, collections, tags, url)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (item.title || "").toLowerCase().includes(q);
        const domainMatch = (item.domain || "").toLowerCase().includes(q);
        const urlMatch = (item.url || "").toLowerCase().includes(q);
        const descMatch = (item.description || "").toLowerCase().includes(q);
        const tagMatch = (item.tags || []).some((t) =>
          t.toLowerCase().includes(q)
        );
        const colMatch = (item.collections || []).some(
          (c) =>
            c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
        );

        if (
          !titleMatch &&
          !domainMatch &&
          !urlMatch &&
          !descMatch &&
          !tagMatch &&
          !colMatch
        ) {
          return false;
        }
      }

      return true;
    });

    // 5. Sorting
    const getItemTime = (item: PortfolioItem) => {
      if (item.created_at) {
        const t = new Date(item.created_at).getTime();
        if (!isNaN(t)) return t;
      }
      if (item.createdAt) return item.createdAt;
      return 0;
    };

    if (sortBy === "alpha") {
      result = [...result].sort((a, b) =>
        (a.title || "").localeCompare(b.title || "", undefined, {
          sensitivity: "base",
        })
      );
    } else if (sortBy === "recent") {
      result = [...result].sort((a, b) => getItemTime(b) - getItemTime(a));
    } else if (sortBy === "featured") {
      result = [...result].sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return getItemTime(b) - getItemTime(a);
      });
    }

    return result;
  }, [
    publicPortfolios,
    showSavedOnly,
    favorites,
    selectedCollections,
    selectedTags,
    searchQuery,
    sortBy,
  ]);

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
            {/* Quick Saved Pill for Public Visitors */}
            {currentRoute === "public" && (
              <button
                type="button"
                onClick={handleToggleSaved}
                title="View your saved bookmarks"
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition ${
                  showSavedOnly
                    ? "bg-amber-400 text-zinc-950 font-semibold shadow-sm"
                    : "border border-white/10 bg-zinc-900/60 text-zinc-300 hover:border-white/20 hover:text-white"
                }`}
              >
                <Bookmark
                  className={`h-3.5 w-3.5 ${
                    favorites.length > 0 || showSavedOnly
                      ? "fill-current text-amber-500"
                      : ""
                  }`}
                />
                <span className="hidden sm:inline">Saved</span>
                {favorites.length > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-semibold ${
                      showSavedOnly
                        ? "bg-black/20 text-zinc-950"
                        : "bg-white/10 text-amber-300"
                    }`}
                  >
                    {favorites.length}
                  </span>
                )}
              </button>
            )}

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
            collections={collections}
            onRefreshData={loadAdminData}
            onRefreshCollections={loadCollections}
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
              The Vibe Coder's Vault
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-zinc-400">
              A curated index of essential AI tools, creative engineering, UI libraries, and inspirations — built so you spend less time hunting for tools and more time building.
            </p>
          </div>

          {/* Search & Collection Filter Controls */}
          <ControlsBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCollections={selectedCollections}
            onToggleCollection={handleToggleCollection}
            onSelectAllCollections={handleSelectAllCollections}
            onClearCollections={handleClearCollections}
            selectedTags={selectedTags}
            onToggleTag={handleToggleTag}
            onClearTags={handleClearTags}
            sortBy={sortBy}
            onSortChange={setSortBy}
            showSavedOnly={showSavedOnly}
            onToggleSaved={handleToggleSaved}
            savedCount={favorites.length}
            collections={collections}
            allPortfolios={publicPortfolios}
            onClearAllFilters={handleClearAllFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Saved Collection Callout */}
          {showSavedOnly && (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                  <Bookmark className="h-4 w-4 fill-current" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-amber-200">
                    Your Saved References
                  </h2>
                  <p className="text-[11px] text-zinc-400">
                    Saved privately in this browser's local storage
                  </p>
                </div>
              </div>
              {favorites.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearFavorites}
                  className="rounded px-2 py-1 text-xs text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition"
                >
                  Clear all
                </button>
              )}
            </div>
          )}

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
            showSavedOnly ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-amber-500/20 bg-zinc-900/20 p-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Bookmark className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-200">
                  No saved references yet
                </h3>
                <p className="mt-1 max-w-sm text-xs text-zinc-400 leading-relaxed">
                  Click the bookmark icon or "Save" button on any website card while browsing to build your personal collection here.
                </p>
                <button
                  type="button"
                  onClick={() => setShowSavedOnly(false)}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200"
                >
                  Browse all references
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-zinc-500">
                  <Inbox className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-200">No resources found</h3>
                <p className="mt-1 text-xs text-zinc-400">
                  Try changing your search or filters.
                </p>
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Clear Filters</span>
                </button>
              </div>
            )
          ) : viewMode === "compact" ? (
            <div className="flex flex-col gap-2.5">
              {filteredPublicPortfolios.map((item) => (
                <PortfolioListItem
                  key={item.id}
                  item={item}
                  isAdmin={false}
                  isFavorite={favorites.includes(item.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onCopyUrl={handleCopyUrl}
                  onFilterByTag={handleToggleTag}
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
                  isFavorite={favorites.includes(item.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onCopyUrl={handleCopyUrl}
                  onFilterByTag={handleToggleTag}
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
        collections={collections}
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
