"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "motion/react";
import { Sparkles } from "lucide-react";

interface SelectionHandleProps {
  position: string;
}

const SelectionHandle = ({ position }: SelectionHandleProps) => {
  return (
    <div
      className={`absolute w-3 h-3 sm:w-3.5 sm:h-3.5 bg-black border-2 border-white rounded-[2px] shadow-[0_0_8px_rgba(255,255,255,0.5)] pointer-events-none z-10 ${position}`}
    />
  );
};

interface FlipWordsProps {
  words: string[];
  duration?: number;
  className?: string;
}

export const FlipWords = ({
  words,
  duration = 2800,
  className = "",
}: FlipWordsProps) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);

    return () => clearInterval(intervalId);
  }, [words, duration]);

  const wordContainerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.04,
      },
    },
    exit: {
      transition: {
        staggerChildren: 0.025,
        staggerDirection: -1,
      },
    },
  };

  const letterVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 8,
      filter: "blur(6px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "tween" as const,
        ease: [0.25, 0.1, 0.25, 1],
        duration: 0.35,
      },
    },
    exit: {
      opacity: 0,
      y: -8,
      filter: "blur(6px)",
      transition: {
        type: "tween" as const,
        ease: [0.4, 0, 0.6, 1],
        duration: 0.25,
      },
    },
  };

  const currentWord = words[index];

  return (
    <div
      className={`inline-block align-middle overflow-hidden h-[1.25em] leading-none ${className}`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentWord}
          variants={wordContainerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="inline-block whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-white"
        >
          {currentWord.split("").map((char, i) => (
            <motion.span
              key={`${currentWord}-${char}-${i}`}
              variants={letterVariants}
              className="inline-block"
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export function HeroHeader() {
  const phrases = [
    "VIBE CODER'S",
    "AI BUILDER'S",
    "CREATIVE DEV'S",
    "DESIGN ENGINEER'S",
    "SHIPPER'S",
  ];

  return (
    <section className="relative mx-auto mb-8 max-w-3xl text-center select-none">
      {/* Subtle background ambient radial light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 left-1/2 -z-10 h-64 w-full max-w-2xl -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent blur-3xl"
      />

      {/* Top Status Pill - Matches Landing Page Pill Design */}
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/80 px-3.5 py-1.5 text-xs text-zinc-300 shadow-sm backdrop-blur-md mb-6 hover:border-white/20 transition">
        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-zinc-200">
          CURATED DESIGN & CODE VAULT
        </span>
        <span className="text-zinc-600">•</span>
        <span className="text-zinc-400 font-mono text-[11px]">vibe coding library</span>
      </div>

      {/* Main Headline with Canvas Selection Box & FlipWords in Landing Page Emerald Gradient */}
      <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2">
        <span className="text-white font-light">The</span>

        {/* Interactive Canvas Selection Box */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="relative inline-flex items-center justify-center my-1"
        >
          <div className="font-mono text-xl sm:text-3xl md:text-4xl font-bold tracking-tight py-1.5 px-3.5 sm:px-5 flex items-center justify-center uppercase relative drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]">
            <FlipWords words={phrases} duration={2800} />
          </div>

          {/* Figma/Canvas Selection Border & Corner Handles */}
          <div className="absolute inset-0 border-2 border-white rounded-lg pointer-events-none bg-white/[0.05] shadow-[0_0_20px_rgba(255,255,255,0.15)]" />

          <SelectionHandle position="-top-1.5 -left-1.5" />
          <SelectionHandle position="-top-1.5 -right-1.5" />
          <SelectionHandle position="-bottom-1.5 -left-1.5" />
          <SelectionHandle position="-bottom-1.5 -right-1.5" />
        </motion.div>

        <span className="text-white">Vault</span>
      </h1>

      {/* Supporting Text matching landing page copy and typography */}
      <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base text-zinc-400 leading-relaxed font-normal">
        AI tools, UI libraries, creative websites, developer resources and
        inspiration, collected in one place.
      </p>
    </section>
  );
}

export default HeroHeader;
