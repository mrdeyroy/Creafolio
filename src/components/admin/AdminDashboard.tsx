import React, { useState, useMemo, useEffect } from "react";
import { PortfolioItem, Collection, ViewMode } from "@/types";
import { PortfolioCard } from "@/components/PortfolioCard";
import { PortfolioListItem } from "@/components/PortfolioListItem";
import { Omnibar } from "@/components/Omnibar";
import { Pagination } from "@/components/Pagination";
import { getCollectionIcon } from "@/components/ControlsBar";
import { DataMigrationModal } from "./DataMigrationModal";
import { ManageCollectionsModal } from "./ManageCollectionsModal";

const ITEMS_PER_PAGE = 12;
import {
  createPortfolio,
  togglePin,
  togglePublish,
} from "@/lib/portfolio-service";
import { validateAndSanitizeUrl } from "@/lib/url-security";
import {
  ArrowLeft,
  LogOut,
  Plus,
  Database,
  Grid,
  List,
  Search,
  X,
  Eye,
  EyeOff,
  Bookmark,
  Layers,
  Inbox,
  FolderKanban,
  SlidersHorizontal,
  Check,
} from "lucide-react";

interface AdminDashboardProps {
  adminEmail: string;
  items: PortfolioItem[];
  collections: Collection[];
  onRefreshData: () => Promise<void>;
  onRefreshCollections: () => Promise<void>;
  onSignOut: () => void;
  onBackToPublic: () => void;
  onOpenEdit: (item: PortfolioItem | null) => void;
  onConfirmDelete: (item: PortfolioItem) => void;
  onShowToast: (msg: string) => void;
  fetchMetadata: (url: string) => Promise<{
    title: string;
    description: string;
    image: string;
    video?: string;
    category?: string;
    guessedCollections?: string[];
    tags?: string[];
  }>;
}

export function AdminDashboard({
  adminEmail,
  items,
  collections,
  onRefreshData,
  onRefreshCollections,
  onSignOut,
  onBackToPublic,
  onOpenEdit,
  onConfirmDelete,
  onShowToast,
  fetchMetadata,
}: AdminDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all"); // 'all' | 'published' | 'drafts' | 'pinned' | collection.slug
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("compact");
  const [isMigrationOpen, setIsMigrationOpen] = useState(false);
  const [isManageCollectionsOpen, setIsManageCollectionsOpen] = useState(false);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);

  // Compute metrics
  const totalCount = items.length;
  const publishedCount = items.filter((i) => i.published).length;
  const draftCount = items.filter((i) => !i.published).length;
  const pinnedCount = items.filter((i) => i.pinned).length;

  // Filter options list for both desktop pills and mobile modal
  const filterOptions = useMemo(() => {
    return [
      { id: "all", label: "All Resources", count: totalCount },
      { id: "published", label: "Live Only", count: publishedCount },
      { id: "drafts", label: "Drafts Only", count: draftCount },
      { id: "pinned", label: "Featured Only", count: pinnedCount },
      ...collections.map((col) => ({
        id: col.slug,
        label: col.name,
        count: items.filter((item) =>
          (item.collections || []).some(
            (c) =>
              c.id === col.id ||
              c.slug.toLowerCase() === col.slug.toLowerCase() ||
              c.name.toLowerCase() === col.name.toLowerCase()
          )
        ).length,
      })),
    ];
  }, [totalCount, publishedCount, draftCount, pinnedCount, collections, items]);

  // Current active filter metadata
  const activeFilterInfo = useMemo(() => {
    const found = filterOptions.find(
      (opt) => opt.id.toLowerCase() === activeFilter.toLowerCase()
    );
    return found || { id: activeFilter, label: activeFilter, count: 0 };
  }, [filterOptions, activeFilter]);

  // Add via Omnibar in Admin view
  const handleAddViaOmnibar = async (url: string) => {
    const validated = validateAndSanitizeUrl(url);
    if (!validated.isValid || !validated.sanitizedUrl) {
      onShowToast(validated.error || "Please enter a valid website address.");
      return;
    }

    const cleanUrl = validated.sanitizedUrl;
    const isDuplicate = items.some(
      (item) => item.url.toLowerCase().replace(/\/+$/, "") === cleanUrl.toLowerCase().replace(/\/+$/, "")
    );
    if (isDuplicate) {
      onShowToast("This resource URL has already been added to Creafolio.");
      return;
    }

    try {
      const meta = await fetchMetadata(cleanUrl);

      // Select strictly ONE primary collection
      const primaryCollectionName =
        meta.guessedCollections && meta.guessedCollections.length > 0
          ? meta.guessedCollections[0]
          : meta.category || "";

      let targetCollectionId = collections[0]?.id;
      if (primaryCollectionName) {
        const match = collections.find(
          (c) =>
            c.name.toLowerCase() === primaryCollectionName.toLowerCase() ||
            c.slug.toLowerCase() === primaryCollectionName.toLowerCase()
        );
        if (match) {
          targetCollectionId = match.id;
        }
      }

      const targetCollectionIds = targetCollectionId ? [targetCollectionId] : [];

      await createPortfolio(
        {
          url: cleanUrl,
          title: meta.title,
          description: meta.description,
          image: meta.image,
          video: meta.video || null,
          previewType: meta.video ? "video" : "image",
          tags: meta.tags && meta.tags.length > 0 ? meta.tags : [meta.category || "Design"],
          published: true,
          pinned: false,
        },
        targetCollectionIds
      );
      await onRefreshData();
      onShowToast(`Added: ${meta.title}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving portfolio";
      onShowToast(msg);
      throw err;
    }
  };

  // Toggle handlers
  const handleTogglePin = async (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    const nextVal = !target.pinned;
    try {
      await togglePin(id, nextVal);
      await onRefreshData();
      onShowToast(nextVal ? "Pinned as featured" : "Unpinned featured");
    } catch {
      onShowToast("Failed to update pin status");
    }
  };

  const handleTogglePublish = async (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    const nextVal = !target.published;
    try {
      await togglePublish(id, nextVal);
      await onRefreshData();
      onShowToast(nextVal ? "Published live" : "Set to draft (hidden)");
    } catch {
      onShowToast("Failed to update publication status");
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    onShowToast("URL copied to clipboard");
  };

  // Filter items
  const filtered = items.filter((item) => {
    if (activeFilter === "published" && !item.published) return false;
    if (activeFilter === "drafts" && item.published) return false;
    if (activeFilter === "pinned" && !item.pinned) return false;
    if (
      activeFilter !== "all" &&
      activeFilter !== "published" &&
      activeFilter !== "drafts" &&
      activeFilter !== "pinned"
    ) {
      const target = activeFilter.toLowerCase();
      const match = (item.collections || []).some(
        (c) =>
          c.slug.toLowerCase() === target ||
          c.name.toLowerCase() === target
      );
      if (!match) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = (item.title || "").toLowerCase().includes(q);
      const matchUrl = (item.url || "").toLowerCase().includes(q);
      const matchDesc = (item.description || "").toLowerCase().includes(q);
      const matchTag = (item.tags || []).some((t) => t.toLowerCase().includes(q));
      const matchCol = (item.collections || []).some((c) =>
        c.name.toLowerCase().includes(q)
      );
      if (!matchTitle && !matchUrl && !matchDesc && !matchTag && !matchCol) return false;
    }
    return true;
  });

  // Reset pagination to page 1 whenever filters or search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    const element = document.getElementById("admin-resources-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <main className="mx-auto w-full max-w-[1180px] px-3 sm:px-6 pt-16 sm:pt-24 pb-20">
      {/* Top Admin Header Bar */}
      <header className="relative z-20 mb-5 sm:mb-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-zinc-900/90 p-3 sm:p-4 shadow-xl backdrop-blur-xl">
        {/* Top row: Public Site, Admin badge, Mobile Logout */}
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={onBackToPublic}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-800/80 px-2 sm:px-2.5 text-xs font-medium text-zinc-300 transition hover:border-white/20 hover:text-white shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>
                <span className="hidden min-[360px]:inline">Public </span>Site
              </span>
            </button>
            <div className="h-4 w-px bg-white/10 shrink-0" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-xs font-semibold text-white truncate">
                <span className="hidden min-[360px]:inline">Owner </span>Admin
              </span>
              <span className="hidden sm:inline font-mono text-xs text-zinc-500 truncate">
                ({adminEmail})
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onSignOut}
            title="Log Out"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-zinc-800/80 text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {/* Action Buttons: 3 equal buttons on mobile, inline on sm+ */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full sm:flex sm:items-center sm:justify-end sm:gap-2 pt-1 border-t border-white/[0.06] sm:border-0 sm:pt-0">
          <button
            type="button"
            onClick={() => setIsManageCollectionsOpen(true)}
            className="inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-1.5 sm:px-3 py-1.5 text-xs font-medium text-amber-300 transition hover:bg-amber-500/20"
          >
            <FolderKanban className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              <span className="min-[380px]:hidden">Cols</span>
              <span className="hidden min-[380px]:inline sm:hidden">Collections</span>
              <span className="hidden sm:inline">Collections ({collections.length})</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsMigrationOpen(true)}
            className="inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg border border-white/10 bg-zinc-800/80 px-1.5 sm:px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-white/20 hover:text-white"
          >
            <Database className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              <span className="sm:hidden">Sync</span>
              <span className="hidden sm:inline">Sync & Backup</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => onOpenEdit(null)}
            className="inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg bg-white px-1.5 sm:px-3 py-1.5 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            <Plus className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              <span className="sm:hidden">New</span>
              <span className="hidden sm:inline">New Resource</span>
            </span>
          </button>
        </div>
      </header>

      {/* KPI Stats Cards */}
      <section className="mb-5 sm:mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
        <div
          onClick={() => setActiveFilter("all")}
          className={`cursor-pointer rounded-xl border p-2.5 sm:p-4 backdrop-blur-md transition ${
            activeFilter === "all"
              ? "border-white/30 bg-zinc-800/60"
              : "border-white/10 bg-zinc-900/60 hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between text-zinc-400 mb-1 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-medium truncate">Total Resources</span>
            <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          </div>
          <div className="text-lg sm:text-2xl font-bold text-white">{totalCount}</div>
        </div>

        <div
          onClick={() => setActiveFilter("published")}
          className={`cursor-pointer rounded-xl border p-2.5 sm:p-4 backdrop-blur-md transition ${
            activeFilter === "published"
              ? "border-emerald-500/40 bg-emerald-950/30"
              : "border-white/10 bg-zinc-900/60 hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between text-zinc-400 mb-1 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-medium truncate">Published (Live)</span>
            <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400 shrink-0" />
          </div>
          <div className="text-lg sm:text-2xl font-bold text-emerald-400">{publishedCount}</div>
        </div>

        <div
          onClick={() => setActiveFilter("drafts")}
          className={`cursor-pointer rounded-xl border p-2.5 sm:p-4 backdrop-blur-md transition ${
            activeFilter === "drafts"
              ? "border-amber-500/40 bg-amber-950/30"
              : "border-white/10 bg-zinc-900/60 hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between text-zinc-400 mb-1 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-medium truncate">Drafts (Hidden)</span>
            <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400 shrink-0" />
          </div>
          <div className="text-lg sm:text-2xl font-bold text-amber-400">{draftCount}</div>
        </div>

        <div
          onClick={() => setActiveFilter("pinned")}
          className={`cursor-pointer rounded-xl border p-2.5 sm:p-4 backdrop-blur-md transition ${
            activeFilter === "pinned"
              ? "border-amber-400/40 bg-zinc-800/60"
              : "border-white/10 bg-zinc-900/60 hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between text-zinc-400 mb-1 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-medium truncate">Featured (Pinned)</span>
            <Bookmark className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400 shrink-0" />
          </div>
          <div className="text-lg sm:text-2xl font-bold text-white">{pinnedCount}</div>
        </div>
      </section>

      {/* Quick Add Omnibar */}
      <div className="mb-5 sm:mb-6">
        <Omnibar onAddUrl={handleAddViaOmnibar} onShowToast={onShowToast} />
      </div>

      {/* Management Filters & Search Bar */}
      <section className="mb-5 sm:mb-6 flex flex-col gap-2.5 sm:gap-3">
        {/* Search Input Row + Mobile Single 'Filters' Button */}
        <div className="flex items-center gap-2 w-full">
          <div className="flex-1 flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-2 transition focus-within:border-white/30">
            <Search className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, URL, tag..."
              autoComplete="off"
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-zinc-500 hover:text-zinc-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Mobile Filters Trigger Button (Combined menus like Public View) */}
          <button
            type="button"
            onClick={() => setIsFiltersModalOpen(true)}
            className={`sm:hidden inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition shrink-0 ${
              activeFilter !== "all"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200 shadow-sm shadow-emerald-950/40"
                : "border-white/10 bg-zinc-900/60 text-zinc-300 hover:border-white/20 hover:text-white"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-400" />
            <span>Filters</span>
            {activeFilter !== "all" && (
              <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-mono font-semibold text-emerald-300">
                1
              </span>
            )}
          </button>
        </div>

        {/* Active Filter indicator chip on mobile when a filter is applied */}
        {activeFilter !== "all" && (
          <div className="flex sm:hidden items-center justify-between gap-2 px-0.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[11px] text-zinc-500 shrink-0">Filtering:</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-emerald-200 text-xs font-medium truncate">
                <span className="truncate">{activeFilterInfo.label}</span>
                <span className="font-mono text-[10px] text-emerald-300 shrink-0">({activeFilterInfo.count})</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className="text-[11px] text-amber-400 hover:text-amber-300 transition shrink-0"
            >
              Reset
            </button>
          </div>
        )}

        {/* Desktop Filter Pills (shown on sm+ screens where full width is available) */}
        <div className="hidden sm:flex sm:flex-wrap sm:items-center gap-1.5 select-none">
          {filterOptions.map((pill) => {
            const active = activeFilter.toLowerCase() === pill.id.toLowerCase();
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setActiveFilter(pill.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 text-xs font-medium transition ${
                  active
                    ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                    : "border border-white/10 bg-zinc-900/50 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                }`}
              >
                <span className="whitespace-nowrap">{pill.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    active ? "bg-zinc-950/20 text-zinc-950" : "bg-white/5 text-zinc-500"
                  }`}
                >
                  {pill.count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Toolbar: Counter & View Mode Switcher */}
      <div id="admin-resources-section" className="mb-4 flex items-center justify-between scroll-mt-24">
        <span className="font-mono text-xs text-zinc-500">
          {filtered.length === 0 ? (
            "0 items"
          ) : (
            <>
              Showing <span className="text-zinc-300 font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</span> of{" "}
              <span className="text-zinc-300 font-medium">{filtered.length}</span> items
              {filtered.length !== totalCount && ` (filtered from ${totalCount})`}
            </>
          )}
        </span>
        <div className="flex items-center rounded-md border border-white/10 bg-zinc-900/60 p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("compact")}
            className={`rounded p-1 transition ${
              viewMode === "compact"
                ? "bg-zinc-800 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`rounded p-1 transition ${
              viewMode === "grid"
                ? "bg-zinc-800 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Grid className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Content Rendering */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-zinc-500">
            <Inbox className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-200">No resources found</h3>
          <p className="mt-1 text-xs text-zinc-500">
            Add a URL above or adjust your search / collection filter.
          </p>
        </div>
      ) : (
        <>
          {viewMode === "compact" ? (
            <div className="flex flex-col gap-2.5">
              {paginatedItems.map((item) => (
                <PortfolioListItem
                  key={item.id}
                  item={item}
                  isAdmin={true}
                  onTogglePin={handleTogglePin}
                  onTogglePublish={handleTogglePublish}
                  onOpenEdit={onOpenEdit}
                  onCopyUrl={handleCopyUrl}
                  onDelete={onConfirmDelete}
                  onFilterByTag={setActiveFilter}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {paginatedItems.map((item) => (
                <PortfolioCard
                  key={item.id}
                  item={item}
                  isAdmin={true}
                  onTogglePin={handleTogglePin}
                  onTogglePublish={handleTogglePublish}
                  onOpenEdit={onOpenEdit}
                  onCopyUrl={handleCopyUrl}
                  onDelete={onConfirmDelete}
                  onFilterByTag={setActiveFilter}
                />
              ))}
            </div>
          )}

          {/* Admin Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
            itemLabel="items"
          />
        </>
      )}

      {/* Manage Collections Modal */}
      <ManageCollectionsModal
        isOpen={isManageCollectionsOpen}
        onClose={() => setIsManageCollectionsOpen(false)}
        collections={collections}
        items={items}
        onRefreshCollections={onRefreshCollections}
        onRefreshData={onRefreshData}
        onShowToast={onShowToast}
      />

      {/* Migration Modal */}
      <DataMigrationModal
        isOpen={isMigrationOpen}
        onClose={() => setIsMigrationOpen(false)}
        adminItems={items}
        onRefreshData={onRefreshData}
        onShowToast={onShowToast}
      />

      {/* Mobile Filter Modal (Combined Menus like Public View) */}
      {isFiltersModalOpen && (
        <div
          onClick={() => setIsFiltersModalOpen(false)}
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[85vh] w-full sm:max-w-lg flex-col rounded-t-2xl sm:rounded-2xl border border-white/15 bg-zinc-900 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Filter Resources</h3>
                {activeFilter !== "all" && (
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-mono font-semibold text-emerald-300">
                    Active
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {activeFilter !== "all" && (
                  <button
                    type="button"
                    onClick={() => setActiveFilter("all")}
                    className="text-xs text-amber-400 hover:text-amber-300 transition"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsFiltersModalOpen(false)}
                  className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {/* Status Section */}
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 px-1">
                  Status
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: "all", label: "All Resources", count: totalCount, icon: Layers },
                    { id: "published", label: "Live Only", count: publishedCount, icon: Eye },
                    { id: "drafts", label: "Drafts (Hidden)", count: draftCount, icon: EyeOff },
                    { id: "pinned", label: "Featured (Pinned)", count: pinnedCount, icon: Bookmark },
                  ].map((s) => {
                    const isSelected = activeFilter.toLowerCase() === s.id.toLowerCase();
                    const Icon = s.icon;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setActiveFilter(s.id);
                        }}
                        className={`flex items-center justify-between rounded-xl border p-2.5 text-left text-xs transition ${
                          isSelected
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                            : "border-white/5 bg-zinc-950/60 text-zinc-300 hover:border-white/15 hover:bg-zinc-900"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition ${
                              isSelected
                                ? "border-emerald-400 bg-emerald-400 text-zinc-950"
                                : "border-zinc-700 bg-zinc-800"
                            }`}
                          >
                            {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                          </div>
                          <Icon className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate font-medium">{s.label}</span>
                        </div>
                        <span className="ml-1 font-mono text-[10px] text-zinc-500 shrink-0">
                          {s.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Collections Section */}
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 px-1">
                  Collections ({collections.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {collections.map((col) => {
                    const isSelected =
                      activeFilter.toLowerCase() === col.slug.toLowerCase() ||
                      activeFilter.toLowerCase() === col.name.toLowerCase();
                    const count = items.filter((item) =>
                      (item.collections || []).some(
                        (c) =>
                          c.id === col.id ||
                          c.slug.toLowerCase() === col.slug.toLowerCase() ||
                          c.name.toLowerCase() === col.name.toLowerCase()
                      )
                    ).length;

                    return (
                      <button
                        key={col.id || col.slug}
                        type="button"
                        onClick={() => {
                          setActiveFilter(col.slug);
                        }}
                        className={`flex items-center justify-between rounded-xl border p-2.5 text-left text-xs transition ${
                          isSelected
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                            : "border-white/5 bg-zinc-950/60 text-zinc-300 hover:border-white/15 hover:bg-zinc-900"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition ${
                              isSelected
                                ? "border-emerald-400 bg-emerald-400 text-zinc-950"
                                : "border-zinc-700 bg-zinc-800"
                            }`}
                          >
                            {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                          </div>
                          <span className="shrink-0">{getCollectionIcon(col.slug)}</span>
                          <span className="truncate font-medium">{col.name}</span>
                        </div>
                        <span className="ml-1 font-mono text-[10px] text-zinc-500 shrink-0">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-white/10 p-3 bg-zinc-950/60 flex items-center justify-between gap-3">
              <span className="text-xs text-zinc-400 truncate">
                Selected: <span className="text-zinc-200 font-medium">{activeFilterInfo.label}</span>
              </span>
              <button
                type="button"
                onClick={() => setIsFiltersModalOpen(false)}
                className="rounded-xl bg-white px-5 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200"
              >
                Apply & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
