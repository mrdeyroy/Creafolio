import React, { useState, useRef } from "react";
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
  Eye,
  EyeOff,
  Sparkles,
  Video,
} from "lucide-react";
import { getSafeExternalUrl } from "@/lib/url-security";

interface PortfolioListItemProps {
  item: PortfolioItem;
  isAdmin?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onTogglePublish?: (id: string) => void;
  onOpenEdit?: (item: PortfolioItem) => void;
  onCopyUrl: (url: string) => void;
  onDelete?: (item: PortfolioItem) => void;
  onFilterByTag: (tag: string) => void;
}

export function PortfolioListItem({
  item,
  isAdmin = false,
  isFavorite = false,
  onToggleFavorite,
  onTogglePin,
  onTogglePublish,
  onOpenEdit,
  onCopyUrl,
  onDelete,
  onFilterByTag,
}: PortfolioListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVideoHovered, setIsVideoHovered] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const hasVideo =
    Boolean(item.video?.trim()) &&
    (item.previewType === "video" || (!item.previewType && Boolean(item.video))) &&
    !hasVideoError;

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
      } ${!item.published && isAdmin ? "opacity-75 ring-1 ring-amber-500/30" : ""}`}
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
                href={getSafeExternalUrl(item.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-sm sm:text-base font-semibold text-zinc-100 transition hover:text-white"
              >
                {item.title}
              </a>
              {item.pinned && (
                <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
                  <Sparkles className="h-2.5 w-2.5 fill-current" />
                  <span>Featured</span>
                </span>
              )}
              {isAdmin && !item.published && (
                <span className="inline-flex items-center gap-1 rounded bg-amber-950/80 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/30">
                  <EyeOff className="h-2.5 w-2.5" />
                  <span>Draft</span>
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
          {/* Collections / Domain Badge */}
          <div className="hidden sm:flex flex-col items-end text-right gap-1 max-w-[220px]">
            <div className="flex flex-wrap justify-end gap-1">
              {(item.collections && item.collections.length > 0
                ? item.collections
                : [{ id: "def", name: "Portfolios", slug: "portfolios" }]
              ).map((c) => (
                <button
                  key={c.id || c.slug}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFilterByTag?.(c.slug || c.name);
                  }}
                  title={`Filter by collection: ${c.name}`}
                  className="rounded bg-zinc-800/80 px-2 py-0.5 text-[11px] font-medium text-zinc-300 border border-white/10 hover:border-white/25 hover:text-white transition"
                >
                  {c.name}
                </button>
              ))}
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
              {item.domain}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {isAdmin ? (
              <>
                {onTogglePin && (
                  <button
                    type="button"
                    onClick={() => onTogglePin(item.id)}
                    title={item.pinned ? "Unpin featured" : "Pin as featured"}
                    className={`rounded-lg p-1.5 transition ${
                      item.pinned
                        ? "text-amber-400 hover:bg-amber-400/10"
                        : "text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
                    }`}
                  >
                    <Bookmark className={`h-4 w-4 ${item.pinned ? "fill-current" : ""}`} />
                  </button>
                )}

                {onTogglePublish && (
                  <button
                    type="button"
                    onClick={() => onTogglePublish(item.id)}
                    title={item.published ? "Set as Draft" : "Publish to Live"}
                    className={`rounded-lg p-1.5 transition hover:bg-white/10 ${
                      item.published ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {item.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onCopyUrl(item.url)}
                  title="Copy URL"
                  className="hidden sm:flex rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-zinc-200"
                >
                  <Copy className="h-4 w-4" />
                </button>

                {onOpenEdit && (
                  <button
                    type="button"
                    onClick={() => onOpenEdit(item)}
                    title="Edit reference"
                    className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-zinc-200"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}

                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    title="Delete"
                    className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </>
            ) : (
              <>
                {onToggleFavorite && (
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(item.id)}
                    title={isFavorite ? "Remove from saved bookmarks" : "Save to bookmarks"}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                      isFavorite
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
                        : "border border-white/10 bg-zinc-900/60 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
                    }`}
                  >
                    <Bookmark className={`h-3.5 w-3.5 ${isFavorite ? "fill-current text-amber-400" : ""}`} />
                    <span className="hidden sm:inline">{isFavorite ? "Saved" : "Save"}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onCopyUrl(item.url)}
                  title="Copy URL"
                  className="hidden sm:flex rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-zinc-200"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Collapse preview" : "Expand preview"}
              className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-zinc-200"
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

      {/* Expanded Accordion Tray */}
      {isExpanded && (
        <div className="border-t border-white/[0.06] bg-zinc-950/60 p-4 transition-all">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Thumbnail Preview */}
            <div
              onMouseEnter={() => {
                setIsVideoHovered(true);
                if (hasVideo && videoRef.current) {
                  videoRef.current.play().catch(() => {});
                }
              }}
              onMouseLeave={() => {
                setIsVideoHovered(false);
                if (hasVideo && videoRef.current) {
                  videoRef.current.pause();
                }
              }}
              className="relative aspect-video w-full md:w-64 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black"
            >
              {hasVideo && (
                <span
                  className={`absolute left-2 bottom-2 z-10 inline-flex items-center gap-1 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-medium text-zinc-300 backdrop-blur-md border border-white/10 transition-opacity duration-200 ${
                    isVideoHovered ? "opacity-30" : "opacity-90"
                  }`}
                >
                  <Video className="h-2.5 w-2.5 text-amber-400" />
                  <span>Video</span>
                </span>
              )}

              <img
                src={item.image || fallbackImg}
                alt={item.title}
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = fallbackImg;
                }}
                className="h-full w-full object-cover object-top"
              />

              {hasVideo && (
                <video
                  ref={videoRef}
                  src={item.video!}
                  poster={item.image || fallbackImg}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onLoadedData={() => setIsVideoLoaded(true)}
                  onError={() => {
                    setHasVideoError(true);
                    setIsVideoHovered(false);
                  }}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 pointer-events-none ${
                    isVideoHovered && isVideoLoaded ? "opacity-100" : "opacity-0"
                  }`}
                />
              )}

              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                <a
                  href={getSafeExternalUrl(item.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-950 shadow hover:scale-105"
                >
                  <span>Visit site</span>
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Expanded Details */}
            <div className="flex flex-1 flex-col justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {item.description || "No full description provided."}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(item.tags || []).map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onFilterByTag(t)}
                      className="rounded bg-zinc-800/80 px-2 py-0.5 text-xs font-mono text-zinc-300 hover:bg-zinc-700 transition"
                    >
                      #{t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                <span className="text-xs text-zinc-500 font-mono">
                  {item.domain}
                </span>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-zinc-300 hover:text-white"
                >
                  <span>Open URL</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
