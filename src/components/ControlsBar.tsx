import React, { useRef, useState } from "react";
import { Search, X, Bookmark } from "lucide-react";

interface ControlsBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTag: string;
  onTagSelect: (tag: string) => void;
}

const CATEGORIES = [
  { tag: "all", label: "All" },
  { tag: "pinned", label: "Featured", icon: true },
  { tag: "Portfolios", label: "Portfolios" },
  { tag: "UI & Components", label: "UI & Components" },
  { tag: "Inspiration", label: "Inspiration" },
  { tag: "Tools & Resources", label: "Tools & Resources" },
];

export function ControlsBar({
  searchQuery,
  onSearchChange,
  activeTag,
  onTagSelect,
}: ControlsBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setHasDragged(false);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 4) {
      setHasDragged(true);
    }
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <section className="mb-6 flex flex-col gap-3">
      {/* Search Input */}
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-zinc-900/60 px-3 py-2 transition focus-within:border-white/30">
        <Search className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search references by title, URL, tag..."
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-500 outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="text-zinc-500 hover:text-zinc-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Category Pills (Draggable on desktop & touch) */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`flex items-center gap-1.5 overflow-x-auto pb-1 select-none no-scrollbar ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeTag.toLowerCase() === cat.tag.toLowerCase();
          return (
            <button
              key={cat.tag}
              type="button"
              onClick={() => {
                if (!hasDragged) onTagSelect(cat.tag);
              }}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                isActive
                  ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                  : "border border-white/10 bg-zinc-900/50 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
              }`}
            >
              {cat.icon && <Bookmark className="h-3 w-3 fill-current" />}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
