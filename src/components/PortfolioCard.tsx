import React, { useState, useRef, useEffect } from "react";
import { PortfolioItem } from "@/types";
import {
  Bookmark,
  Pencil,
  Copy,
  Trash2,
  ArrowUpRight,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles,
  Video,
} from "lucide-react";
import { getSafeExternalUrl } from "@/lib/url-security";

interface PortfolioCardProps {
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

export function PortfolioCard({
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
}: PortfolioCardProps) {
  const fallbackImg = `https://image.thum.io/get/width/800/crop/600/${encodeURIComponent(item.url)}`;
  const faviconUrl =
    item.icon ||
    `https://unavatar.io/${item.domain}?fallback=https://icons.duckduckgo.com/ip3/${item.domain}.ico`;

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mq.matches);
      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mq.addEventListener?.("change", handler);
      return () => mq.removeEventListener?.("change", handler);
    }
  }, []);

  // Pause video if card scrolls out of viewport
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && videoRef.current) {
          videoRef.current.pause();
          setIsHovered(false);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const hasVideo =
    Boolean(item.video?.trim()) &&
    (item.previewType === "video" || (!item.previewType && Boolean(item.video))) &&
    !hasVideoError &&
    !prefersReducedMotion;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (hasVideo && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Playback interrupted or prevented by browser
        });
      }
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hasVideo && videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-xl border bg-zinc-900/80 shadow-md backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:shadow-xl ${
        item.pinned ? "border-amber-500/40" : "border-white/10"
      } ${!item.published && isAdmin ? "opacity-75 ring-1 ring-amber-500/30" : ""}`}
    >
      {/* Thumbnail Area */}
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative aspect-video w-full overflow-hidden bg-black"
      >
        {item.pinned && (
          <span className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded bg-black/80 px-2 py-0.5 text-[10px] font-semibold text-amber-400 backdrop-blur-md border border-amber-500/30">
            <Sparkles className="h-2.5 w-2.5 fill-current" />
            <span>Featured</span>
          </span>
        )}

        {isAdmin && !item.published && (
          <span className="absolute left-2 bottom-2 z-10 inline-flex items-center gap-1 rounded bg-amber-950/90 px-2 py-0.5 text-[10px] font-semibold text-amber-300 backdrop-blur-md border border-amber-500/40">
            <EyeOff className="h-2.5 w-2.5" />
            <span>Draft</span>
          </span>
        )}

        {/* Video Preview Indicator badge */}
        {hasVideo && (
          <span
            className={`absolute ${isAdmin && !item.published ? "left-20" : "left-2"} bottom-2 z-10 inline-flex items-center gap-1 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-medium text-zinc-300 backdrop-blur-md border border-white/10 transition-opacity duration-200 ${
              isHovered ? "opacity-30" : "opacity-90"
            }`}
            title="Hover to play dynamic video preview"
          >
            <Video className="h-2.5 w-2.5 text-amber-400" />
            <span>Video</span>
          </span>
        )}

        <div className="absolute right-2 top-2 z-10 flex items-center gap-1.5 max-w-[75%] justify-end">
          <div className="flex flex-wrap items-center justify-end gap-1">
            {(item.collections && item.collections.length > 0
              ? item.collections
              : [{ id: "def", name: "Portfolios", slug: "portfolios" }]
            ).map((c) => (
              <span
                key={c.id || c.slug}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onFilterByTag?.(c.slug || c.name);
                }}
                title={`Filter by collection: ${c.name}`}
                className="rounded bg-black/80 px-2 py-0.5 text-[10px] font-medium text-zinc-300 backdrop-blur-md border border-white/10 hover:border-white/30 hover:text-white transition cursor-pointer"
              >
                {c.name}
              </span>
            ))}
          </div>
          {!isAdmin && onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite(item.id);
              }}
              title={isFavorite ? "Remove from saved" : "Save to bookmarks"}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded backdrop-blur-md border transition ${
                isFavorite
                  ? "bg-amber-500 text-zinc-950 border-amber-400 shadow-sm"
                  : "bg-black/80 border-white/10 text-zinc-400 hover:text-white hover:bg-black"
              }`}
            >
              <Bookmark className={`h-3 w-3 ${isFavorite ? "fill-current" : ""}`} />
            </button>
          )}
        </div>

        {/* Fallback & Poster Image */}
        <img
          src={item.image || fallbackImg}
          alt={item.title}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImg;
          }}
          className={`h-full w-full object-cover object-top transition-transform duration-500 ${
            !hasVideo ? "group-hover:scale-105" : ""
          }`}
        />

        {/* Dynamic Video Layer */}
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
              setIsHovered(false);
            }}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 pointer-events-none ${
              isHovered && isVideoLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {/* Hover Quick Visit Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <a
            href={getSafeExternalUrl(item.url)}
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
              href={getSafeExternalUrl(item.url)}
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
              className="rounded bg-zinc-800/70 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition"
            >
              #{t}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Action Toolbar */}
      <div className="flex items-center justify-between border-t border-white/[0.06] bg-zinc-950/40 px-3 py-2 text-zinc-400">
        <div className="flex items-center gap-1">
          {isAdmin ? (
            <>
              {onTogglePin && (
                <button
                  type="button"
                  onClick={() => onTogglePin(item.id)}
                  title={item.pinned ? "Unpin featured" : "Pin as featured"}
                  className={`rounded p-1 transition hover:bg-white/10 ${
                    item.pinned ? "text-amber-400" : "hover:text-zinc-200"
                  }`}
                >
                  <Bookmark className={`h-3.5 w-3.5 ${item.pinned ? "fill-current" : ""}`} />
                </button>
              )}
              {onTogglePublish && (
                <button
                  type="button"
                  onClick={() => onTogglePublish(item.id)}
                  title={item.published ? "Unpublish to draft" : "Publish to live"}
                  className={`rounded p-1 transition hover:bg-white/10 ${
                    item.published ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {item.published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
              )}
              {onOpenEdit && (
                <button
                  type="button"
                  onClick={() => onOpenEdit(item)}
                  title="Edit details"
                  className="rounded p-1 hover:bg-white/10 hover:text-zinc-200"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => onCopyUrl(item.url)}
                title="Copy URL"
                className="rounded p-1 hover:bg-white/10 hover:text-zinc-200"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(item)}
                  title="Delete reference"
                  className="rounded p-1 hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-1.5">
              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={() => onToggleFavorite(item.id)}
                  title={isFavorite ? "Remove from saved bookmarks" : "Save to my collection"}
                  className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium transition ${
                    isFavorite
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
                      : "text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
                  }`}
                >
                  <Bookmark className={`h-3 w-3 ${isFavorite ? "fill-current text-amber-400" : ""}`} />
                  <span>{isFavorite ? "Saved" : "Save"}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => onCopyUrl(item.url)}
                title="Copy URL"
                className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs text-zinc-400 transition hover:bg-white/10 hover:text-zinc-200"
              >
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </button>
            </div>
          )}
        </div>

        <a
          href={getSafeExternalUrl(item.url)}
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
