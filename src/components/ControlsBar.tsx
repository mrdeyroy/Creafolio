import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Search,
  X,
  Bookmark,
  Sparkles,
  Folder,
  Tag,
  ArrowUpDown,
  Check,
  ChevronDown,
  RotateCcw,
  Globe,
  SlidersHorizontal,
  Layers,
  Box,
  Brain,
  Code,
  Type,
  Compass,
} from "lucide-react";
import { Collection, PortfolioItem } from "@/types";
import { DEFAULT_COLLECTIONS } from "@/lib/portfolio-service";

export type SortOption = "default" | "recent" | "alpha" | "featured";

export interface ControlsBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCollections: string[];
  onToggleCollection: (slug: string) => void;
  onSelectAllCollections: () => void;
  onClearCollections: () => void;
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  showSavedOnly: boolean;
  onToggleSaved: () => void;
  savedCount?: number;
  collections?: Collection[];
  allPortfolios: PortfolioItem[];
  onClearAllFilters: () => void;
  hasActiveFilters: boolean;
  filteredCount?: number;
}

const SORT_LABELS: Record<SortOption, string> = {
  default: "Default",
  recent: "Recently Added",
  alpha: "Alphabetical (A–Z)",
  featured: "Featured First",
};

export const getCollectionIcon = (slug: string) => {
  switch (slug) {
    case "ui-components":
      return <Layers className="h-4 w-4 text-emerald-400" />;
    case "landing-pages":
      return <Globe className="h-4 w-4 text-cyan-400" />;
    case "portfolios":
      return <Folder className="h-4 w-4 text-amber-400" />;
    case "design-systems":
      return <Sparkles className="h-4 w-4 text-purple-400" />;
    case "animations-interactions":
      return <Sparkles className="h-4 w-4 text-pink-400" />;
    case "3d-webgl":
      return <Box className="h-4 w-4 text-blue-400" />;
    case "ai-tools":
      return <Brain className="h-4 w-4 text-emerald-300" />;
    case "developer-tools":
      return <Code className="h-4 w-4 text-teal-400" />;
    case "fonts-icons-assets":
      return <Type className="h-4 w-4 text-amber-300" />;
    case "inspiration-experiments":
      return <Compass className="h-4 w-4 text-rose-400" />;
    default:
      return <Folder className="h-4 w-4 text-zinc-400" />;
  }
};

export function ControlsBar({
  searchQuery,
  onSearchChange,
  selectedCollections,
  onToggleCollection,
  onSelectAllCollections,
  onClearCollections,
  selectedTags,
  onToggleTag,
  onClearTags,
  sortBy,
  onSortChange,
  showSavedOnly,
  onToggleSaved,
  savedCount = 0,
  collections = DEFAULT_COLLECTIONS,
  allPortfolios,
  onClearAllFilters,
  hasActiveFilters,
  filteredCount,
}: ControlsBarProps) {
  const effectiveCollections =
    collections && collections.length > 0 ? collections : DEFAULT_COLLECTIONS;

  // State
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<"collections" | "tags">("collections");
  const [tagSearch, setTagSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const filtersModalRef = useRef<HTMLDivElement>(null);

  // Global shortcut (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setIsFiltersOpen(false);
        setIsSortOpen(false);
        setIsSearchFocused(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (sortRef.current && !sortRef.current.contains(target)) {
        setIsSortOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute collection counts
  const collectionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const col of effectiveCollections) {
      counts[col.slug] = 0;
    }
    for (const item of allPortfolios) {
      for (const col of item.collections || []) {
        if (counts[col.slug] !== undefined) {
          counts[col.slug]++;
        }
      }
    }
    return counts;
  }, [effectiveCollections, allPortfolios]);

  // Compute available tags with counts
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of allPortfolios) {
      for (const t of item.tags || []) {
        const clean = t.trim().toLowerCase();
        if (!clean) continue;
        counts[clean] = (counts[clean] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }, [allPortfolios]);

  // Filtered tags for the tags picker
  const filteredTags = useMemo(() => {
    if (!tagSearch.trim()) return tagCounts;
    const q = tagSearch.toLowerCase().trim();
    return tagCounts.filter((tc) => tc.tag.includes(q));
  }, [tagCounts, tagSearch]);

  // Autocomplete Suggestions
  const suggestions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q || !isSearchFocused) return null;

    const matchingCols = effectiveCollections
      .filter((c) => c.name.toLowerCase().includes(q) || c.slug.includes(q))
      .slice(0, 3);

    const matchingTags = tagCounts
      .filter((tc) => tc.tag.includes(q))
      .slice(0, 4)
      .map((tc) => tc.tag);

    const matchingItems = allPortfolios
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          (item.domain && item.domain.toLowerCase().includes(q))
      )
      .slice(0, 4);

    const hasAny =
      matchingCols.length > 0 ||
      matchingTags.length > 0 ||
      matchingItems.length > 0;

    return hasAny
      ? {
          collections: matchingCols,
          tags: matchingTags,
          items: matchingItems,
        }
      : null;
  }, [searchQuery, isSearchFocused, effectiveCollections, tagCounts, allPortfolios]);

  const activeFiltersCount = selectedCollections.length + selectedTags.length;
  const resultDisplayCount =
    typeof filteredCount === "number" ? filteredCount : allPortfolios.length;

  return (
    <section className="mb-5 flex flex-col gap-2.5 sm:gap-3" ref={containerRef}>
      {/* 1. Prominent Search Bar */}
      <div className="relative w-full" ref={searchContainerRef}>
        <div className="group flex items-center gap-2.5 rounded-xl border border-white/10 bg-zinc-900/70 px-3.5 py-2.5 transition focus-within:border-emerald-500/40 focus-within:bg-zinc-900/90 shadow-sm">
          <Search className="h-4 w-4 text-zinc-400 group-focus-within:text-emerald-400 shrink-0 transition-colors" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Search tools, libraries, inspirations..."
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => {
                onSearchChange("");
                setIsSearchFocused(false);
              }}
              title="Clear search"
              className="rounded p-0.5 text-zinc-500 hover:text-zinc-200 transition"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-white/10 bg-zinc-800/80 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 select-none">
              ⌘ K
            </kbd>
          )}
        </div>

        {/* Autocomplete Suggestions Dropdown */}
        {suggestions && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-white/10 bg-zinc-900/95 p-2 shadow-2xl backdrop-blur-xl">
            {suggestions.collections.length > 0 && (
              <div className="mb-2">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Collections
                </div>
                <div className="flex flex-wrap gap-1 px-1">
                  {suggestions.collections.map((col) => {
                    const isSelected = selectedCollections.includes(col.slug);
                    return (
                      <button
                        key={col.slug}
                        type="button"
                        onClick={() => {
                          onToggleCollection(col.slug);
                          onSearchChange("");
                          setIsSearchFocused(false);
                        }}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition ${
                          isSelected
                            ? "bg-zinc-100 text-zinc-950 font-medium"
                            : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                        }`}
                      >
                        {getCollectionIcon(col.slug)}
                        <span>{col.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {suggestions.tags.length > 0 && (
              <div className="mb-2">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Tags
                </div>
                <div className="flex flex-wrap gap-1 px-1">
                  {suggestions.tags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          onToggleTag(tag);
                          onSearchChange("");
                          setIsSearchFocused(false);
                        }}
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs transition ${
                          isSelected
                            ? "bg-zinc-100 text-zinc-950 font-medium"
                            : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                        }`}
                      >
                        <Tag className="h-3 w-3 text-zinc-400" />
                        <span>#{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {suggestions.items.length > 0 && (
              <div>
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Resources
                </div>
                <div className="flex flex-col gap-0.5">
                  {suggestions.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSearchChange(item.title);
                        setIsSearchFocused(false);
                      }}
                      className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs text-zinc-200 transition hover:bg-white/10"
                    >
                      <span className="truncate font-medium">{item.title}</span>
                      <span className="ml-2 truncate text-[11px] font-mono text-zinc-500">
                        {item.domain}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Unified Controls Bar: Search → Filters → Sort → Saved */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Unified Filters Trigger Button */}
          <button
            type="button"
            onClick={() => setIsFiltersOpen(true)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              activeFiltersCount > 0
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200 shadow-sm shadow-emerald-950/40"
                : "border-white/10 bg-zinc-900/60 text-zinc-300 hover:border-white/20 hover:text-white"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-mono font-semibold text-emerald-300">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Simple Sort Dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                sortBy !== "default"
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                  : "border-white/10 bg-zinc-900/60 text-zinc-300 hover:border-white/20 hover:text-white"
              }`}
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400" />
              <span className="sm:hidden">Sort</span>
              <span className="hidden sm:inline">Sort: {SORT_LABELS[sortBy]}</span>
              <ChevronDown className="h-3 w-3 text-zinc-500" />
            </button>

            {isSortOpen && (
              <div className="absolute left-0 top-full z-40 mt-1.5 w-48 rounded-xl border border-white/10 bg-zinc-900/98 p-1.5 shadow-2xl backdrop-blur-xl">
                {(
                  [
                    "default",
                    "recent",
                    "alpha",
                    "featured",
                  ] as SortOption[]
                ).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onSortChange(option);
                      setIsSortOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                      sortBy === option
                        ? "bg-amber-500/10 font-semibold text-amber-200"
                        : "text-zinc-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span>{SORT_LABELS[option]}</span>
                    {sortBy === option && (
                      <Check className="h-3.5 w-3.5 text-amber-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Saved Bookmarks Pill */}
          <button
            type="button"
            onClick={onToggleSaved}
            title="Show saved references"
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              showSavedOnly
                ? "border-amber-500/40 bg-amber-500/10 text-amber-200 shadow-sm"
                : "border-white/10 bg-zinc-900/60 text-zinc-300 hover:border-white/20 hover:text-white"
            }`}
          >
            <Bookmark
              className={`h-3.5 w-3.5 ${
                showSavedOnly || savedCount > 0
                  ? "fill-current text-amber-400"
                  : "text-zinc-400"
              }`}
            />
            <span>Saved</span>
            {savedCount > 0 && (
              <span
                className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-mono font-semibold transition ${
                  showSavedOnly
                    ? "bg-amber-400 text-zinc-950"
                    : "bg-amber-500/20 text-amber-300"
                }`}
              >
                {savedCount}
              </span>
            )}
          </button>
        </div>

        {/* Desktop Quick Clear (if any filter is active) */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAllFilters}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* 3. Active Filters Indicator Strip */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[11px] text-zinc-500 mr-0.5">Active:</span>

          {searchQuery && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-zinc-800/80 px-2.5 py-0.5 text-xs text-zinc-200">
              <span className="text-zinc-500">search:</span>
              <span className="font-medium truncate max-w-[140px]">"{searchQuery}"</span>
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="text-zinc-500 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {selectedCollections.map((slug) => {
            const col = effectiveCollections.find((c) => c.slug === slug);
            return (
              <span
                key={slug}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-200"
              >
                {getCollectionIcon(slug)}
                <span>{col?.name || slug}</span>
                <button
                  type="button"
                  onClick={() => onToggleCollection(slug)}
                  className="text-emerald-400/80 hover:text-emerald-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}

          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-zinc-800/90 px-2.5 py-0.5 text-xs text-zinc-200"
            >
              <Tag className="h-3 w-3 text-zinc-400" />
              <span>#{tag}</span>
              <button
                type="button"
                onClick={() => onToggleTag(tag)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {sortBy !== "default" && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-200">
              <span>Sort: {SORT_LABELS[sortBy]}</span>
              <button
                type="button"
                onClick={() => onSortChange("default")}
                className="text-amber-400/80 hover:text-amber-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {showSavedOnly && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-200">
              <Bookmark className="h-3 w-3 fill-current text-amber-400" />
              <span>Saved Only</span>
              <button
                type="button"
                onClick={onToggleSaved}
                className="text-amber-400/80 hover:text-amber-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={onClearAllFilters}
            className="text-[11px] text-zinc-400 underline hover:text-zinc-200 ml-1 transition"
          >
            Clear all
          </button>
        </div>
      )}

      {/* 4. Unified Filters Modal / Sheet (Responsive: Bottom Sheet on Mobile, Centered Modal on Tablet/Desktop) */}
      {isFiltersOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-150">
          <div
            ref={filtersModalRef}
            className="w-full max-h-[85vh] sm:max-w-lg rounded-t-3xl sm:rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-5 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Filters</h3>
                {activeFiltersCount > 0 && (
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-mono font-semibold text-emerald-300">
                    {activeFiltersCount} active
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      onClearCollections();
                      onClearTags();
                    }}
                    className="text-xs text-zinc-400 hover:text-amber-300 transition"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsFiltersOpen(false)}
                  className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Filter Tabs: Collections vs Tags */}
            <div className="flex items-center gap-2 border-b border-white/5 py-2.5">
              <button
                type="button"
                onClick={() => setFilterTab("collections")}
                className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition ${
                  filterTab === "collections"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Collections
                {selectedCollections.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-mono text-emerald-300">
                    {selectedCollections.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("tags")}
                className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition ${
                  filterTab === "tags"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Tags
                {selectedTags.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-mono text-emerald-300">
                    {selectedTags.length}
                  </span>
                )}
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto py-3 no-scrollbar space-y-3">
              {filterTab === "collections" ? (
                <div>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-[11px] text-zinc-400">
                      Select one or multiple collections:
                    </span>
                    <div className="flex items-center gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={onSelectAllCollections}
                        className="text-zinc-400 hover:text-zinc-200 transition"
                      >
                        Select all
                      </button>
                      {selectedCollections.length > 0 && (
                        <button
                          type="button"
                          onClick={onClearCollections}
                          className="text-amber-400 hover:text-amber-300 transition"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {effectiveCollections.map((col) => {
                      const isChecked = selectedCollections.includes(col.slug);
                      const count = collectionCounts[col.slug] || 0;
                      return (
                        <button
                          key={col.slug}
                          type="button"
                          onClick={() => onToggleCollection(col.slug)}
                          className={`flex items-center justify-between rounded-xl border p-2.5 text-left text-xs transition ${
                            isChecked
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                              : "border-white/5 bg-zinc-900/50 text-zinc-300 hover:border-white/15 hover:bg-zinc-900"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <div
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                                isChecked
                                  ? "border-emerald-400 bg-emerald-400 text-zinc-950"
                                  : "border-zinc-700 bg-zinc-800"
                              }`}
                            >
                              {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                            </div>
                            <span className="shrink-0">{getCollectionIcon(col.slug)}</span>
                            <span className="truncate font-medium">{col.name}</span>
                          </div>
                          <span className="ml-1.5 font-mono text-[10px] text-zinc-500">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-2">
                    <input
                      type="text"
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      placeholder="Search tags (e.g. ai, 3d, animation)..."
                      className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-emerald-500/40"
                    />
                  </div>

                  {filteredTags.length === 0 ? (
                    <div className="py-6 text-center text-xs text-zinc-500">
                      No tags found matching "{tagSearch}"
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-1">
                      {filteredTags.map(({ tag, count }) => {
                        const isChecked = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => onToggleTag(tag)}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition ${
                              isChecked
                                ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 font-medium"
                                : "border border-white/5 bg-zinc-900/60 text-zinc-400 hover:border-white/15 hover:text-zinc-200"
                            }`}
                          >
                            <Tag className="h-3 w-3 text-zinc-500" />
                            <span>#{tag}</span>
                            <span className="font-mono text-[10px] text-zinc-500">
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-white/10 pt-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  onClearCollections();
                  onClearTags();
                }}
                className="text-xs text-zinc-400 hover:text-white transition"
              >
                Clear all
              </button>

              <button
                type="button"
                onClick={() => setIsFiltersOpen(false)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center rounded-xl bg-zinc-100 px-5 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-white"
              >
                Show {resultDisplayCount} reference{resultDisplayCount === 1 ? "" : "s"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
