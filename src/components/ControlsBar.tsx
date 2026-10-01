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
}

const SORT_LABELS: Record<SortOption, string> = {
  default: "Default",
  recent: "Recently Added",
  alpha: "Alphabetical (A–Z)",
  featured: "Featured First",
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
}: ControlsBarProps) {
  const effectiveCollections =
    collections && collections.length > 0 ? collections : DEFAULT_COLLECTIONS;

  // Popover state
  const [activeDropdown, setActiveDropdown] = useState<
    "collections" | "tags" | "sort" | null
  >(null);
  const [tagSearch, setTagSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setActiveDropdown(null);
      }
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
        setIsSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
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

  // Filtered tags for the tags dropdown
  const filteredTags = useMemo(() => {
    if (!tagSearch.trim()) return tagCounts;
    const q = tagSearch.toLowerCase().trim();
    return tagCounts.filter((tc) => tc.tag.includes(q));
  }, [tagCounts, tagSearch]);

  // Search Autocomplete Suggestions
  const suggestions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q || !isSearchFocused) return null;

    // Matching Collections
    const matchingCols = effectiveCollections
      .filter((c) => c.name.toLowerCase().includes(q) || c.slug.includes(q))
      .slice(0, 3);

    // Matching Tags
    const matchingTags = tagCounts
      .filter((tc) => tc.tag.includes(q))
      .slice(0, 4)
      .map((tc) => tc.tag);

    // Matching Items (Titles / Domains)
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

  const toggleDropdown = (name: "collections" | "tags" | "sort") => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  return (
    <section className="mb-6 flex flex-col gap-3" ref={containerRef}>
      {/* 1. Search Bar with Autocomplete Suggestions */}
      <div className="relative" ref={searchContainerRef}>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/70 px-3.5 py-2.5 transition focus-within:border-white/30 focus-within:bg-zinc-900/90 shadow-sm">
          <Search className="h-4 w-4 text-zinc-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Search references across title, domain, description, collections, tags..."
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                onSearchChange("");
                setIsSearchFocused(false);
              }}
              title="Clear search"
              className="text-zinc-500 hover:text-zinc-200 transition"
            >
              <X className="h-4 w-4" />
            </button>
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
                        <Folder className="h-3 w-3 text-amber-400" />
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

      {/* 2. Controls & Filter Popovers Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Collections Dropdown/Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("collections")}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                selectedCollections.length > 0
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                  : "border-white/10 bg-zinc-900/60 text-zinc-300 hover:border-white/20 hover:text-white"
              }`}
            >
              <Folder className="h-3.5 w-3.5 text-zinc-400" />
              <span>Collections</span>
              {selectedCollections.length > 0 && (
                <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-mono font-semibold text-amber-300">
                  {selectedCollections.length}
                </span>
              )}
              <ChevronDown className="h-3 w-3 text-zinc-500" />
            </button>

            {activeDropdown === "collections" && (
              <div className="absolute left-0 top-full z-40 mt-1.5 w-64 max-w-[calc(100vw-2.5rem)] rounded-xl border border-white/10 bg-zinc-900/95 p-2 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/10 px-2 pb-2 pt-1">
                  <span className="text-xs font-semibold text-zinc-200">
                    Collections
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

                <div className="mt-1.5 max-h-72 overflow-y-auto space-y-0.5 no-scrollbar">
                  {effectiveCollections.map((col) => {
                    const isChecked = selectedCollections.includes(col.slug);
                    const count = collectionCounts[col.slug] || 0;
                    return (
                      <button
                        key={col.slug}
                        type="button"
                        onClick={() => onToggleCollection(col.slug)}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                          isChecked
                            ? "bg-amber-500/10 text-amber-200"
                            : "text-zinc-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                              isChecked
                                ? "border-amber-400 bg-amber-400 text-zinc-950"
                                : "border-zinc-700 bg-zinc-800"
                            }`}
                          >
                            {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span className="truncate">{col.name}</span>
                        </div>
                        <span className="ml-2 font-mono text-[10px] text-zinc-500">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Tags Dropdown/Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("tags")}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                selectedTags.length > 0
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                  : "border-white/10 bg-zinc-900/60 text-zinc-300 hover:border-white/20 hover:text-white"
              }`}
            >
              <Tag className="h-3.5 w-3.5 text-zinc-400" />
              <span>Tags</span>
              {selectedTags.length > 0 && (
                <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-mono font-semibold text-amber-300">
                  {selectedTags.length}
                </span>
              )}
              <ChevronDown className="h-3 w-3 text-zinc-500" />
            </button>

            {activeDropdown === "tags" && (
              <div className="absolute left-0 top-full z-40 mt-1.5 w-64 max-w-[calc(100vw-2.5rem)] rounded-xl border border-white/10 bg-zinc-900/95 p-2 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/10 px-2 pb-2 pt-1">
                  <span className="text-xs font-semibold text-zinc-200">
                    Filter by Tags
                  </span>
                  {selectedTags.length > 0 && (
                    <button
                      type="button"
                      onClick={onClearTags}
                      className="text-[11px] text-amber-400 hover:text-amber-300 transition"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Tag Search Input */}
                <div className="mt-2 px-1">
                  <input
                    type="text"
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    placeholder="Search tags..."
                    className="w-full rounded-md border border-white/10 bg-zinc-800/80 px-2 py-1 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-white/30"
                  />
                </div>

                <div className="mt-1.5 max-h-60 overflow-y-auto space-y-0.5 no-scrollbar">
                  {filteredTags.length === 0 ? (
                    <div className="py-4 text-center text-xs text-zinc-500">
                      No tags matching "{tagSearch}"
                    </div>
                  ) : (
                    filteredTags.map(({ tag, count }) => {
                      const isChecked = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => onToggleTag(tag)}
                          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                            isChecked
                              ? "bg-amber-500/10 text-amber-200"
                              : "text-zinc-300 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <div
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                                isChecked
                                  ? "border-amber-400 bg-amber-400 text-zinc-950"
                                  : "border-zinc-700 bg-zinc-800"
                              }`}
                            >
                              {isChecked && (
                                <Check className="h-3 w-3 stroke-[3]" />
                              )}
                            </div>
                            <span className="truncate">#{tag}</span>
                          </div>
                          <span className="ml-2 font-mono text-[10px] text-zinc-500">
                            {count}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("sort")}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                sortBy !== "default"
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                  : "border-white/10 bg-zinc-900/60 text-zinc-300 hover:border-white/20 hover:text-white"
              }`}
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400" />
              <span>Sort: {SORT_LABELS[sortBy]}</span>
              <ChevronDown className="h-3 w-3 text-zinc-500" />
            </button>

            {activeDropdown === "sort" && (
              <div className="absolute left-0 top-full z-40 mt-1.5 w-52 max-w-[calc(100vw-2.5rem)] rounded-xl border border-white/10 bg-zinc-900/95 p-1.5 shadow-2xl backdrop-blur-xl">
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
                      setActiveDropdown(null);
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
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              showSavedOnly
                ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                : "border-white/10 bg-zinc-900/60 text-zinc-300 hover:border-white/20 hover:text-white"
            }`}
          >
            <Bookmark
              className={`h-3.5 w-3.5 ${
                showSavedOnly || savedCount > 0
                  ? "fill-current text-amber-400"
                  : ""
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

        {/* Clear Filters Button (When any filter is active) */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAllFilters}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/20 transition"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Clear filters</span>
          </button>
        )}
      </div>

      {/* 3. Active Filter Badges Strip */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-zinc-500 mr-1">Active:</span>

          {searchQuery && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-zinc-800/80 px-2.5 py-0.5 text-xs text-zinc-200">
              <span className="text-zinc-500">search:</span>
              <span className="font-medium">"{searchQuery}"</span>
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
                className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-200"
              >
                <Folder className="h-3 w-3 text-amber-400" />
                <span>{col?.name || slug}</span>
                <button
                  type="button"
                  onClick={() => onToggleCollection(slug)}
                  className="text-amber-400/80 hover:text-amber-200"
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
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-zinc-800/80 px-2.5 py-0.5 text-xs text-zinc-300">
              <span>Sort: {SORT_LABELS[sortBy]}</span>
              <button
                type="button"
                onClick={() => onSortChange("default")}
                className="text-zinc-500 hover:text-white"
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

      {/* 4. Quick Collections Pill Row (Multi-Select Aware & Responsive Wrapping) */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5">
        {/* All Pill (resets collections selection) */}
        <button
          type="button"
          onClick={onClearCollections}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
            selectedCollections.length === 0
              ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
              : "border border-white/10 bg-zinc-900/50 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
          }`}
        >
          <span>All</span>
        </button>

        {/* Dynamic Collections */}
        {effectiveCollections.map((col) => {
          const isSelected = selectedCollections.includes(col.slug);
          const count = collectionCounts[col.slug] || 0;
          return (
            <button
              key={col.id || col.slug}
              type="button"
              onClick={() => onToggleCollection(col.slug)}
              title={col.description || col.name}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                isSelected
                  ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                  : "border border-white/10 bg-zinc-900/50 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
              }`}
            >
              <span>{col.name}</span>
              {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
              {!isSelected && count > 0 && (
                <span className="text-[10px] font-mono text-zinc-500">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
