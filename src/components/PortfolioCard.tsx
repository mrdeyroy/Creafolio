import React from "react";
import { PortfolioItem } from "@/types";
import { Bookmark, Pencil, Copy, Trash2, ArrowUpRight, ExternalLink } from "lucide-react";

interface PortfolioCardProps {
  item: PortfolioItem;
  onTogglePin: (id: string) => void;
  onOpenEdit: (item: PortfolioItem) => void;
  onCopyUrl: (url: string) => void;
  onDelete: (item: PortfolioItem) => void;
  onFilterByTag: (tag: string) => void;
}

export function PortfolioCard({
  item,
  onTogglePin,
  onOpenEdit,
  onCopyUrl,
  onDelete,
  onFilterByTag,
}: PortfolioCardProps) {
  const fallbackImg = `https://image.thum.io/get/width/800/crop/600/${encodeURIComponent(item.url)}`;
  const faviconUrl = item.icon || `https://unavatar.io/${item.domain}?fallback=https://icons.duckduckgo.com/ip3/${item.domain}.ico`;

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-xl border bg-zinc-900/80 shadow-md backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:shadow-xl ${
        item.pinned ? "border-amber-500/40" : "border-white/10"
      }`}
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        {item.pinned && (
          <span className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded bg-black/80 px-2 py-0.5 text-[10px] font-semibold text-amber-400 backdrop-blur-md border border-amber-500/30">
            <Bookmark className="h-2.5 w-2.5 fill-current" />
            <span>Saved</span>
          </span>
        )}
        <span className="absolute right-2 top-2 z-10 rounded bg-black/80 px-2 py-0.5 text-[10px] font-medium text-zinc-300 backdrop-blur-md border border-white/10">
          {item.category || "Portfolios"}
        </span>

        <img
          src={item.image || fallbackImg}
          alt={item.title}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImg;
          }}
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />

        {/* Hover Quick Visit Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-zinc-950 shadow-lg transition hover:scale-105"
          >
            <span>Visit site</span>
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={faviconUrl}
            alt=""
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://icons.duckduckgo.com/ip3/${item.domain}.ico`;
            }}
            className="h-5 w-5 rounded bg-zinc-800 border border-white/10 object-cover shrink-0"
          />
          <div className="min-w-0 flex-1">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-sm font-semibold text-zinc-100 transition hover:text-white"
              title={item.title}
            >
              {item.title}
            </a>
            <div className="truncate text-xs text-zinc-500">{item.domain}</div>
          </div>
        </div>

        <p className="line-clamp-2 text-xs leading-relaxed text-zinc-400">
          {item.description || "Design & web reference."}
        </p>

        {/* Tag labels */}
        <div className="mt-auto flex flex-wrap gap-1 pt-1">
          {(item.tags || []).map((t, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onFilterByTag(t)}
              className="rounded bg-zinc-800/70 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Action Toolbar */}
      <div className="flex items-center justify-between border-t border-white/[0.06] bg-zinc-950/40 px-3 py-2 text-zinc-400">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onTogglePin(item.id)}
            title={item.pinned ? "Remove bookmark" : "Save bookmark"}
            className={`rounded p-1 transition hover:bg-white/10 ${
              item.pinned ? "text-amber-400" : "hover:text-zinc-200"
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${item.pinned ? "fill-current" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => onOpenEdit(item)}
            title="Edit details"
            className="rounded p-1 hover:bg-white/10 hover:text-zinc-200"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onCopyUrl(item.url)}
            title="Copy URL"
            className="rounded p-1 hover:bg-white/10 hover:text-zinc-200"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            title="Delete reference"
            className="rounded p-1 hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 hover:text-zinc-100"
        >
          <span>Open</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </article>
  );
}
