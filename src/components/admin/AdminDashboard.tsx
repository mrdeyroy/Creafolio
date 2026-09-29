import React, { useState } from "react";
import { PortfolioItem, ViewMode } from "@/types";
import { PortfolioCard } from "@/components/PortfolioCard";
import { PortfolioListItem } from "@/components/PortfolioListItem";
import { Omnibar } from "@/components/Omnibar";
import { DataMigrationModal } from "./DataMigrationModal";
import {
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  togglePin,
  togglePublish,
} from "@/lib/portfolio-service";
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
  Sparkles,
} from "lucide-react";

interface AdminDashboardProps {
  adminEmail: string;
  items: PortfolioItem[];
  onRefreshData: () => Promise<void>;
  onSignOut: () => void;
  onBackToPublic: () => void;
  onOpenEdit: (item: PortfolioItem | null) => void;
  onConfirmDelete: (item: PortfolioItem) => void;
  onShowToast: (msg: string) => void;
  fetchMetadata: (url: string) => Promise<{
    title: string;
    description: string;
    image: string;
    category: string;
  }>;
}

export function AdminDashboard({
  adminEmail,
  items,
  onRefreshData,
  onSignOut,
  onBackToPublic,
  onOpenEdit,
  onConfirmDelete,
  onShowToast,
  fetchMetadata,
}: AdminDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all"); // 'all' | 'published' | 'drafts' | 'pinned' | category
  const [viewMode, setViewMode] = useState<ViewMode>("compact");
  const [isMigrationOpen, setIsMigrationOpen] = useState(false);

  // Compute metrics
  const totalCount = items.length;
  const publishedCount = items.filter((i) => i.published).length;
  const draftCount = items.filter((i) => !i.published).length;
  const pinnedCount = items.filter((i) => i.pinned).length;

  // Add via Omnibar in Admin view
  const handleAddViaOmnibar = async (url: string) => {
    try {
      const meta = await fetchMetadata(url);
      await createPortfolio({
        url,
        title: meta.title,
        description: meta.description,
        image: meta.image,
        category: meta.category,
        published: true,
        pinned: false,
      });
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
      if (item.category.toLowerCase() !== activeFilter.toLowerCase()) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = (item.title || "").toLowerCase().includes(q);
      const matchUrl = (item.url || "").toLowerCase().includes(q);
      const matchDesc = (item.description || "").toLowerCase().includes(q);
      const matchTag = (item.tags || []).some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchUrl && !matchDesc && !matchTag) return false;
    }
    return true;
  });

  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 pt-20 sm:pt-24 pb-20 sm:px-6">
      {/* Top Admin Header Bar */}
      <header className="relative z-20 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-900/90 p-4 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToPublic}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-800/80 px-2.5 text-xs font-medium text-zinc-300 transition hover:border-white/20 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Public Site</span>
          </button>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-white">Owner Admin</span>
            <span className="hidden sm:inline font-mono text-xs text-zinc-500">
              ({adminEmail})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMigrationOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-800/80 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-white/20 hover:text-white"
          >
            <Database className="h-3.5 w-3.5" />
            <span>Sync & Backup</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenEdit(null)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Resource</span>
          </button>
          <button
            type="button"
            onClick={onSignOut}
            title="Log Out"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-zinc-800/80 text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* KPI Stats Cards */}
      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div
          onClick={() => setActiveFilter("all")}
          className={`cursor-pointer rounded-xl border p-4 backdrop-blur-md transition ${
            activeFilter === "all"
              ? "border-white/30 bg-zinc-800/60"
              : "border-white/10 bg-zinc-900/60 hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Total Resources</span>
            <Layers className="h-4 w-4" />
          </div>
          <div className="text-2xl font-bold text-white">{totalCount}</div>
        </div>

        <div
          onClick={() => setActiveFilter("published")}
          className={`cursor-pointer rounded-xl border p-4 backdrop-blur-md transition ${
            activeFilter === "published"
              ? "border-emerald-500/40 bg-emerald-950/30"
              : "border-white/10 bg-zinc-900/60 hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Published (Live)</span>
            <Eye className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{publishedCount}</div>
        </div>

        <div
          onClick={() => setActiveFilter("drafts")}
          className={`cursor-pointer rounded-xl border p-4 backdrop-blur-md transition ${
            activeFilter === "drafts"
              ? "border-amber-500/40 bg-amber-950/30"
              : "border-white/10 bg-zinc-900/60 hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Drafts (Hidden)</span>
            <EyeOff className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{draftCount}</div>
        </div>

        <div
          onClick={() => setActiveFilter("pinned")}
          className={`cursor-pointer rounded-xl border p-4 backdrop-blur-md transition ${
            activeFilter === "pinned"
              ? "border-amber-400/40 bg-zinc-800/60"
              : "border-white/10 bg-zinc-900/60 hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Featured (Pinned)</span>
            <Bookmark className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{pinnedCount}</div>
        </div>
      </section>

      {/* Quick Add Omnibar */}
      <div className="mb-6">
        <Omnibar onAddUrl={handleAddViaOmnibar} onShowToast={onShowToast} />
      </div>

      {/* Management Filters & Search Bar */}
      <section className="mb-6 flex flex-col gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-zinc-900/60 px-3 py-2 transition focus-within:border-white/30">
          <Search className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources by title, URL, tag..."
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-500 outline-none"
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

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 select-none">
          {[
            { id: "all", label: "All Resources" },
            { id: "published", label: "Live Only" },
            { id: "drafts", label: "Drafts Only" },
            { id: "pinned", label: "Featured Only" },
            { id: "Portfolios", label: "Portfolios" },
            { id: "UI & Components", label: "UI & Components" },
            { id: "Inspiration", label: "Inspiration" },
            { id: "Tools & Resources", label: "Tools" },
          ].map((pill) => {
            const active = activeFilter.toLowerCase() === pill.id.toLowerCase();
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setActiveFilter(pill.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  active
                    ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                    : "border border-white/10 bg-zinc-900/50 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Toolbar: Counter & View Mode Switcher */}
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-xs text-zinc-500">
          Showing {filtered.length} of {totalCount} items
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
            Add a URL above or adjust your search filter.
          </p>
        </div>
      ) : viewMode === "compact" ? (
        <div className="flex flex-col gap-2.5">
          {filtered.map((item) => (
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
          {filtered.map((item) => (
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

      {/* Migration Modal */}
      <DataMigrationModal
        isOpen={isMigrationOpen}
        onClose={() => setIsMigrationOpen(false)}
        adminItems={items}
        onRefreshData={onRefreshData}
        onShowToast={onShowToast}
      />
    </main>
  );
}
