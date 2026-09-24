import React from "react";

export function BrandLogo({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-2">
      <a href="#" className="group inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-100 hover:opacity-95">
        <span className="logo-mark relative flex h-[30px] w-[30px] items-center justify-center overflow-hidden rounded-md border border-white/10 bg-zinc-900 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:rotate-[-2deg] group-hover:border-white/30">
          <svg className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="4" />
            <path d="M9 3v18" />
            <path d="M14 9h5" className="logo-line logo-line-1 origin-[9px_center] transition-transform duration-300 group-hover:translate-x-[1.5px] group-hover:scale-x-110" />
            <path d="M14 15h5" className="logo-line logo-line-2 origin-[9px_center] transition-transform duration-300 group-hover:translate-x-[2px] group-hover:scale-x-120" />
          </svg>
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-white">Creafolio</span>
      </a>
      <span className="h-1 w-1 rounded-full bg-zinc-600" />
      <span className="font-mono text-xs text-zinc-500 whitespace-nowrap">{count} indexed</span>
    </div>
  );
}
