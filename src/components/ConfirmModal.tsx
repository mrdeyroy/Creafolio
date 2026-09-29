import React from "react";
import { AlertCircle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  isDanger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl border border-white/15 bg-zinc-900 shadow-2xl overflow-hidden"
      >
        <div className="flex items-start gap-3.5 p-5">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
              isDanger
                ? "border-red-500/30 bg-red-500/10 text-red-400"
                : "border-white/15 bg-zinc-800 text-zinc-200"
            }`}
          >
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-zinc-400">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-white/10 bg-zinc-950/40 px-5 py-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold shadow transition ${
              isDanger
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-white text-zinc-950 hover:bg-zinc-200"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
