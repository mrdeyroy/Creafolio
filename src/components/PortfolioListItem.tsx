import React, { useState } from "react";
import { PortfolioItem } from "@/types";
import {
  Bookmark,
  Pencil,
  Copy,
  Trash2,
  ArrowUpRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface PortfolioListItemProps {
  item: PortfolioItem;
  onTogglePin: (id: string) => void;
  onOpenEdit: (item: PortfolioItem) => void;
  onCopyUrl: (url: string) => void;
  onDelete: (item: PortfolioItem) => void;
  onFilterByTag: (tag: string) => void;
}

export function PortfolioListItem({
  item,
  onTogglePin,
  onOpenEdit,
  onCopyUrl,
  onDelete,
  onFilterByTag,
}: PortfolioListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const faviconUrl =
    item.icon ||
    `https://unavatar.io/${item.domain}?fallback=https://icons.duckduckgo.com/ip3/${item.domain}.ico`;
  const fallbackImg = `https://image.thum.io/get/width/800/crop/600/${encodeURIComponent(item.url)}`;

  return (
    <div
      className={`group relative flex flex-col rounded-xl border transition-all duration-200 ${
        item.pinned
          ? "border-amber-500/30 bg-zinc-900/80 shadow-sm"
          : "border-white/[0.08] bg-zinc-900/40 hover:border-white/20 hover:bg-zinc-900/70"
      }`}
    >
      {/* Main Row */}
      <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4">
        {/* Left: Icon & Info */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Logo / Favicon Box */}
          <div className="relative flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-zinc-950 p-2 shadow-inner">
            <img
              src={faviconUrl}
              alt=""
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://icons.duckduckgo.com/ip3/${item.domain}.ico`;
              }}
              className="h-full w-full object-contain"
            />
            {item.pinned && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400 ring-2 ring-zinc-950" />
            )}
          </div>

          {/* Text Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-sm sm:text-base font-semibold text-zinc-100 transition hover:text-white"
              >
                {item.title}
              </a>
              {item.pinned && (
                <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
                  <Bookmark className="h-2.5 w-2.5 fill-current" />
                  <span>Saved</span>
                </span>
              )}
            </div>

            <div className="mt-0.5 flex items-center gap-2 text-xs sm:text-sm text-zinc-400 truncate">
              <span className="truncate">{item.description || item.domain}</span>
            </div>
          </div>
        </div>

        {/* Right: Meta & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Category / Domain Badge */}
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-xs font-medium text-zinc-300">
              {item.category || "Portfolios"}
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              {item.domain}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onTogglePin(item.id)}
              title={item.pinned ? "Remove bookmark" : "Save bookmark"}
              className={`rounded-lg p-1.5 transition ${
                item.pinned
                  ? "text-amber-400 hover:bg-amber-400/10"
                  : "text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
              }`}
            >
              <Bookmark className={`h-4 w-4 ${item.pinned ? "fill-current" : ""}`} />
            </button>

            <button
              type="button"
              onClick={() => onCopyUrl(item.url)}
              title="Copy URL"
              className="hidden sm:flex rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-zinc-200"
            >
              <Copy className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => onOpenEdit(item)}
              title="Edit reference"
              className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-zinc-200"
            >
              <Pencil className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => onDelete(item)}
              title="Delete"
              className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              title="Visit site"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800/80 text-zinc-200 transition hover:bg-white hover:text-zinc-950"
            >
              <ArrowUpRight className="h-4 w-4" />
            </a>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Collapse preview" : "Expand preview"}
              className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/10 hover:text-zinc-300"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Preview Dropdown */}
      {isExpanded && (
        <div className="border-t border-white/[0.08] bg-zinc-950/60 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start rounded-b-xl">
          <div className="aspect-video w-full sm:w-56 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black">
            <img
              src={item.image || fallbackImg}
              alt={item.title}
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = fallbackImg;
              }}
              className="h-full w-full object-cover object-top"
            />
          </div>
          <div className="flex flex-1 flex-col gap-2 min-w-0">
            <div className="text-xs font-semibold text-zinc-300">About & Tags</div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {item.description || "No description provided."}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {(item.tags || []).map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onFilterByTag(t)}
                  className="rounded-md bg-zinc-800 px-2 py-0.5 text-[11px] font-mono text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
