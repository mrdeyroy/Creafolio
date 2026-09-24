import React from "react";
import { Check } from "lucide-react";

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 pointer-events-none">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-zinc-900 px-4 py-2 text-xs font-medium text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
        <Check className="h-3.5 w-3.5 text-zinc-400" />
        <span>{message}</span>
      </div>
    </div>
  );
}
