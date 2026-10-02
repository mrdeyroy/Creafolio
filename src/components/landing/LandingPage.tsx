"use client";
import React, { useState, useMemo, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { PortfolioItem, Collection } from "@/types";
import { getSafeExternalUrl } from "@/lib/url-security";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Compass,
  Layers,
  Search,
  Sparkles,
  Terminal,
  Code2,
  Box,
  Palette,
  Film,
  Cpu,
  Type,
  Lightbulb,
  Globe,
  SlidersHorizontal,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Command,
  Zap,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

interface LandingPageProps {
  items: PortfolioItem[];
  collections: Collection[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onNavigate: (
    route: "explore" | "admin",
    params?: { collection?: string; tag?: string; saved?: boolean }
  ) => void;
  onCopyUrl?: (url: string) => void;
}

// Icon helper for standard collections
const getCollectionIcon = (slug: string) => {
  switch (slug) {
    case "ui-components":
      return Code2;
    case "landing-pages":
      return Globe;
    case "portfolios":
      return Compass;
    case "design-systems":
      return Palette;
    case "animations-interactions":
      return Film;
    case "3d-webgl":
      return Box;
    case "ai-tools":
      return Cpu;
    case "developer-tools":
      return Terminal;
    case "fonts-icons-assets":
      return Type;
    case "inspiration-experiments":
      return Lightbulb;
    default:
      return Layers;
  }
};

export function LandingPage({
  items,
  collections,
  favorites,
  onToggleFavorite,
  onNavigate,
}: LandingPageProps) {
  const shouldReduceMotion = useReducedMotion();

  // Video Preview State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(18);
  const [activeChapter, setActiveChapter] = useState(0);

  const CHAPTERS = useMemo(
    () => [
      { id: 0, label: "01 The Vault", time: 0 },
      { id: 1, label: "02 FlipWords & Omnibar", time: 4.8 },
      { id: 2, label: "03 Curated Cards", time: 9.0 },
      { id: 3, label: "04 Instant Bookmark", time: 12.0 },
    ],
    []
  );

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 18;
    setCurrentTime(current);
    setDuration(dur);
    setProgress((current / dur) * 100);

    if (current < 4.8) setActiveChapter(0);
    else if (current < 9.0) setActiveChapter(1);
    else if (current < 12.0) setActiveChapter(2);
    else setActiveChapter(3);
  };

  const seekToChapter = (time: number, id: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setActiveChapter(id);
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = ratio * (videoRef.current.duration || 18);
    videoRef.current.currentTime = newTime;
    setProgress(ratio * 100);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleReplay = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
  };

  // Compute counts per collection
  const collectionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of items) {
      if (item.collections && Array.isArray(item.collections)) {
        for (const c of item.collections) {
          counts[c.slug] = (counts[c.slug] || 0) + 1;
        }
      }
    }
    return counts;
  }, [items]);

  const handleScrollToHowItWorks = () => {
    const el = document.getElementById("how-it-works");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-[1140px] px-4 pt-24 pb-24 sm:px-6">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative pt-8 pb-20 sm:pt-16 sm:pb-28 text-center select-none">
        {/* Subtle background ambient radial light */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-10 left-1/2 -z-10 h-72 w-full max-w-2xl -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent blur-3xl"
        />

        {/* Small Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/80 px-3.5 py-1.5 text-xs text-zinc-300 shadow-sm backdrop-blur-md mb-6 hover:border-white/20 transition"
        >
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-zinc-200">
            A LIBRARY FOR CURIOUS BUILDERS
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400 font-mono text-[11px]">v1.0</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mx-auto max-w-4xl text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08]"
        >
          Stop Searching.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-white">
            Start Building.
          </span>
        </motion.h1>

        {/* Supporting Text */}
        <motion.p
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-zinc-400 leading-relaxed font-normal"
        >
          AI tools, UI libraries, creative websites, developer resources and
          inspiration, collected in one place.
        </motion.p>

        {/* Primary & Secondary CTAs */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
        >
          <button
            type="button"
            onClick={() => onNavigate("explore")}
            className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-white/5 transition hover:bg-zinc-200 active:scale-[0.98]"
          >
            <span>Explore the Library</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>

          <button
            type="button"
            onClick={handleScrollToHowItWorks}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-white/10 bg-zinc-900/60 px-5 py-3 text-sm font-medium text-zinc-300 backdrop-blur-sm transition hover:border-white/20 hover:bg-zinc-800/80 hover:text-white"
          >
            <span>How it works</span>
          </button>
        </motion.div>

        {/* Key Indicators / Monospace Micro-Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.32 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-xs text-zinc-500"
        >
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400">✦</span> 10 Curated Collections
          </span>
          <span className="hidden sm:inline text-zinc-800">•</span>
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400">✦</span> {items.length}+ Hand-Vetted References
          </span>
          <span className="hidden sm:inline text-zinc-800">•</span>
          <span className="flex items-center gap-1.5">
            <span className="text-amber-400">✦</span> 100% Free & Open
          </span>
        </motion.div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SHOW THE ACTUAL PRODUCT (Premium Video Showcase of the Webapp) */}
      {/* ========================================================================= */}
      <section className="relative mb-32 pt-8">
        {/* Ambient Backlight Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-12 -z-10 h-96 w-full max-w-4xl -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-500/20 via-teal-500/10 to-transparent blur-[110px]"
        />

        {/* Clean Editorial Section Header (No competing giant heading) */}
        <div className="mx-auto max-w-5xl mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-emerald-400 mb-1.5">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold">Interactive Walkthrough</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400 font-normal">18s Product Tour</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Inside the Vault
              </h2>
            </div>

            {/* Interactive Chapter Scrubbing Pills aligned cleanly to the right */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {CHAPTERS.map((ch) => {
                const isActive = activeChapter === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => seekToChapter(ch.time, ch.id)}
                    className={`group relative inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-mono transition-all duration-300 ${
                      isActive
                        ? "border border-emerald-400/50 bg-emerald-500/15 text-white shadow-[0_0_16px_rgba(16,185,129,0.3)]"
                        : "border border-white/10 bg-zinc-900/60 text-zinc-400 hover:border-white/20 hover:bg-zinc-800/80 hover:text-zinc-200"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full transition-colors ${
                        isActive
                          ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"
                          : "bg-zinc-600 group-hover:bg-zinc-400"
                      }`}
                    />
                    <span className="font-medium tracking-tight">{ch.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Machined Hardware Bezel with Corner Registration Crosshairs */}
        <div className="relative mx-auto max-w-5xl">
          {/* Subtle Technical Corner Crosshairs (Linear & Vercel Design Language) */}
          <div className="absolute -top-3 -left-3 text-zinc-700 font-mono text-xs select-none pointer-events-none hidden sm:block">+</div>
          <div className="absolute -top-3 -right-3 text-zinc-700 font-mono text-xs select-none pointer-events-none hidden sm:block">+</div>
          <div className="absolute -bottom-3 -left-3 text-zinc-700 font-mono text-xs select-none pointer-events-none hidden sm:block">+</div>
          <div className="absolute -bottom-3 -right-3 text-zinc-700 font-mono text-xs select-none pointer-events-none hidden sm:block">+</div>

          {/* Outer Bezel Frame */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/15 bg-zinc-950/90 p-2 sm:p-2.5 shadow-[0_0_70px_-15px_rgba(16,185,129,0.2),0_30px_90px_-20px_rgba(0,0,0,0.95)] ring-1 ring-white/10 group">
            {/* Minimal Hardware Rail Header */}
            <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-2.5 mb-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-700/80 border border-white/5" />
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-700/80 border border-white/5" />
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-700/80 border border-white/5" />
                </div>
                <div className="hidden sm:flex items-center gap-1.5 ml-2 rounded-md bg-zinc-900/90 border border-white/10 px-2.5 py-0.5 font-mono text-[11px] text-zinc-400">
                  <span className="text-emerald-400">🔒</span>
                  <span className="text-zinc-200">creafolio.vercel.app</span>
                  <span className="text-emerald-400">/explore</span>
                </div>
              </div>

              {/* Active Chapter Indicator */}
              <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-zinc-300 font-medium">
                  {CHAPTERS[activeChapter]?.label || "Live Preview"}
                </span>
              </div>
            </div>

            {/* Seamless Edge-to-Edge Video Canvas */}
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl sm:rounded-2xl bg-black border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] flex items-center justify-center">
              <video
                ref={videoRef}
                src="/preview.mp4"
                poster="/preview.jpg"
                autoPlay
                loop
                muted={isMuted}
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onClick={togglePlay}
                className="h-full w-full object-cover cursor-pointer"
              />

              {/* Center Play Overlay on Pause */}
              <div
                onClick={togglePlay}
                className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity cursor-pointer ${
                  isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
              >
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-xl text-white border border-white/30 shadow-[0_0_40px_rgba(16,185,129,0.3)] transition hover:scale-105 active:scale-95">
                  <Play className="h-7 w-7 fill-white ml-1 text-white" />
                </div>
              </div>

              {/* Floating Luxury Glass Capsule Dock (Apple / Linear style) */}
              <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 sm:gap-3 rounded-full border border-white/20 bg-zinc-950/80 px-3.5 py-1.5 sm:px-4 sm:py-2 text-white shadow-2xl backdrop-blur-xl transition-all duration-300">
                {/* Play / Pause Toggle */}
                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-1 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                </button>

                {/* Scrubber Line */}
                <div
                  onClick={handleSeek}
                  className="group/track relative w-24 sm:w-48 md:w-60 h-1.5 bg-zinc-700/80 hover:h-2 rounded-full cursor-pointer transition-all overflow-hidden"
                  title="Seek timeline"
                >
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-100 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Time Display */}
                <span className="font-mono text-[10px] sm:text-[11px] text-zinc-300 whitespace-nowrap">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                <div className="h-3 w-px bg-white/20" />

                {/* Mute Toggle */}
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-emerald-400" />}
                </button>

                {/* Replay */}
                <button
                  type="button"
                  onClick={handleReplay}
                  className="p-1 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition"
                  title="Replay from start"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>

                {/* Fullscreen */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-1 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition hidden sm:inline-flex"
                  title="Toggle fullscreen"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Bento Feature Highlight Cards Below the Video (Linear / Vercel style) */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-md transition-all hover:border-white/20 hover:bg-zinc-900/80 group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                  <Command className="h-4 w-4" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400/90 font-semibold">
                  01 SEARCH
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white">Sub-millisecond Omnibar</h3>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                Fuzzy search across names, tags, and domains with global <kbd className="rounded border border-white/15 bg-zinc-800 px-1 py-0.5 font-mono text-[10px] text-zinc-300">⌘K</kbd> instant activation.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-md transition-all hover:border-white/20 hover:bg-zinc-900/80 group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 group-hover:scale-105 transition-transform">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-teal-400/90 font-semibold">
                  02 CURATION
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white">10 Curated Disciplines</h3>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                Zero placeholder slop. Vetted 3D WebGL, interactive shaders, modern UI kits, and cutting-edge AI builder tools.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-md transition-all hover:border-white/20 hover:bg-zinc-900/80 group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
                  <Bookmark className="h-4 w-4" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400/90 font-semibold">
                  03 SAVES
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white">Frictionless Local Vault</h3>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                Save references to your private collection in one tap. No sign-up wall, passwords, or cloud latency.
              </p>
            </div>
          </div>

          {/* Quick Direct Exploration Action Bar */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/10 bg-gradient-to-r from-zinc-900/80 via-zinc-900/50 to-zinc-900/80 p-4 sm:px-6 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Compass className="h-5 w-5" />
              </div>
              <div className="text-center sm:text-left">
                <div className="text-sm font-semibold text-white">Ready to explore the live vault?</div>
                <div className="text-xs text-zinc-400">Search and filter {items.length}+ curated builder references in real time.</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("explore")}
              className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200 active:scale-95 whitespace-nowrap shadow-lg shadow-white/5"
            >
              <span>Open Explore Library</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. "WHY I BUILT THIS" SECTION */}
      {/* ========================================================================= */}
      <section className="relative mb-28 border-y border-white/10 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 mb-6">
            <span>//</span>
            <span className="uppercase tracking-wider">WHY I BUILT THIS</span>
          </div>

          <div className="space-y-6 text-xl sm:text-2xl font-light text-zinc-300 leading-relaxed">
            <p>
              I kept finding interesting tools, websites and resources, then losing them again.
            </p>
            <p>
              So I started collecting them.
            </p>
            <p className="text-white font-normal">
              Creafolio is that collection, organized into one place for anyone who likes exploring the web and building things.
            </p>
          </div>

          {/* Highlighted Quote Callout */}
          <div className="mt-10 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-5 sm:p-6 backdrop-blur-sm">
            <div className="text-sm sm:text-base font-medium text-emerald-200">
              “Spend less time searching. More time building.”
            </div>
            <div className="mt-2 text-xs text-zinc-400 font-mono">
              Zero algorithmic feeds • Zero sponsored ads • Hand-curated for flow state
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. COLLECTIONS SECTION */}
      {/* ========================================================================= */}
      <section className="relative mb-28">
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-emerald-400">
            <span>01 // DIRECTORY</span>
          </div>
          <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white">
            10 Curated Collections
          </h2>
          <p className="mt-2 text-sm text-zinc-400 max-w-xl">
            Each collection is hand-vetted and categorized for immediate reference. Click any collection to explore filtered resources.
          </p>
        </div>

        {/* Editorial Collections List */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {collections.map((col, index) => {
            const Icon = getCollectionIcon(col.slug);
            const count = collectionCounts[col.slug] || 0;
            const indexStr = String(index + 1).padStart(2, "0");

            return (
              <button
                key={col.slug}
                type="button"
                onClick={() => onNavigate("explore", { collection: col.slug })}
                className="group relative flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-zinc-950/70 p-4 text-left transition duration-200 hover:border-emerald-500/40 hover:bg-zinc-900/80 active:scale-[0.99]"
              >
                <div className="flex items-start gap-3.5">
                  <span className="font-mono text-xs text-zinc-600 group-hover:text-emerald-400 transition-colors pt-0.5">
                    {indexStr}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                      <h3 className="font-semibold text-sm text-white group-hover:text-emerald-300 transition-colors">
                        {col.name}
                      </h3>
                    </div>
                    {col.description && (
                      <p className="mt-1 text-xs text-zinc-400 line-clamp-1 leading-normal">
                        {col.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-0.5">
                  <span className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[11px] text-zinc-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-300 transition">
                    {count}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-zinc-600 transition-transform group-hover:translate-x-1 group-hover:text-emerald-400" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. DISCOVERY SECTION ("How it works") */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="relative mb-28 scroll-mt-24">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-emerald-400 mb-2">
            <span>02 // DISCOVERY</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white max-w-2xl mx-auto">
            Find something interesting. Save it. Come back when you need it.
          </h2>
          <p className="mt-3 text-sm text-zinc-400 max-w-xl mx-auto">
            Built without friction. No signups required, instant local saving, and quick-copy utilities.
          </p>
        </div>

        {/* 4 Feature Pillars with Real UI Elements */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Pillar 1: Search */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-5 flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white text-base">Instant Search</h3>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                Filter across titles, descriptions, frameworks, and domains in milliseconds.
              </p>
            </div>
            <div className="mt-6 rounded-lg border border-white/5 bg-zinc-950 p-2.5 font-mono text-[11px] text-zinc-500 flex items-center justify-between">
              <span>Press / to search</span>
              <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300">⌘K</kbd>
            </div>
          </div>

          {/* Pillar 2: Collections */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-5 flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white text-base">Curated Taxonomies</h3>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                Hand-vetted collections from WebGL shaders to production UI design systems.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-1">
              <span className="rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 font-mono text-[10px]">
                #3D & WebGL
              </span>
              <span className="rounded bg-zinc-800 text-zinc-400 px-2 py-0.5 font-mono text-[10px]">
                #AI Tools
              </span>
            </div>
          </div>

          {/* Pillar 3: Granular Tags */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-5 flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-4">
                <Terminal className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white text-base">Precision Tags</h3>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                Filter by exact tech stack: Three.js, Tailwind, Framer Motion, Next.js, and GLSL.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-1">
              {["threejs", "tailwind", "gsap"].map((t) => (
                <span
                  key={t}
                  className="rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 px-1.5 py-0.5 font-mono text-[10px]"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>

          {/* Pillar 4: Saved Resources */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-5 flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4">
                <Bookmark className="h-5 w-5 fill-current" />
              </div>
              <h3 className="font-semibold text-white text-base">Private Bookmarks</h3>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                Save references to your browser storage. Zero logins, zero tracking, always accessible.
              </p>
            </div>
            <div className="mt-6 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5 font-mono text-[11px] text-amber-300 flex items-center justify-between">
              <span>{favorites.length} saved references</span>
              <Bookmark className="h-3.5 w-3.5 fill-current" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. FINAL CTA */}
      {/* ========================================================================= */}
      <section className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/60 to-zinc-950 p-8 sm:p-14 text-center overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-10 left-1/2 -z-10 h-48 w-full max-w-xl -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl"
        />

        <div className="inline-flex items-center gap-2 font-mono text-xs text-emerald-400 mb-3">
          <Sparkles className="h-3 w-3" />
          <span>START EXPLORING</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
          Got something worth exploring?
        </h2>

        <p className="mx-auto mt-4 max-w-lg text-sm sm:text-base text-zinc-400 leading-relaxed">
          Browse the collection and find your next source of inspiration.
        </p>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => onNavigate("explore")}
            className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-zinc-950 shadow-xl shadow-white/5 transition hover:bg-zinc-200 active:scale-[0.98]"
          >
            <span>Explore Creafolio</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. EDITORIAL FOOTER */}
      {/* ========================================================================= */}
      <footer className="mt-20 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-zinc-500 sm:flex-row">
        <div>
          © {new Date().getFullYear()} Creafolio — The Vibe Coder's Vault. All rights reserved.
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <button
            type="button"
            onClick={() => onNavigate("explore")}
            className="hover:text-zinc-300 transition"
          >
            Explore Library
          </button>
          <button
            type="button"
            onClick={() => onNavigate("explore", { saved: true })}
            className="hover:text-zinc-300 transition"
          >
            Saved References ({favorites.length})
          </button>
          <button
            type="button"
            onClick={() => onNavigate("admin")}
            className="hover:text-zinc-300 transition"
          >
            Owner Portal
          </button>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
