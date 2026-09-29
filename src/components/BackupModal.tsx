import React from "react";
import { X, Download, Upload, RotateCcw } from "lucide-react";

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onImportFile: (file: File) => void;
  onResetDefaults: () => void;
}

export function BackupModal({
  isOpen,
  onClose,
  onExport,
  onImportFile,
  onResetDefaults,
}: BackupModalProps) {
  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImportFile(e.target.files[0]);
      e.target.value = "";
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-xl border border-white/15 bg-zinc-900 p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-base font-semibold text-white">Backup & Sync</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-4 text-xs leading-relaxed text-zinc-400">
          Your collection is saved in local browser storage. Export a backup to sync between your phone and computer.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="flex flex-col gap-2 rounded-lg border border-white/10 bg-zinc-950/60 p-3.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
              <Download className="h-4 w-4 text-zinc-400" />
              <h4>Export</h4>
            </div>
            <p className="text-[11px] text-zinc-500">Download all saved links as a JSON file.</p>
            <button
              type="button"
              onClick={onExport}
              className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700"
            >
              <span>Download JSON</span>
            </button>
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-dashed border-white/20 bg-zinc-950/60 p-3.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
              <Upload className="h-4 w-4 text-zinc-400" />
              <h4>Import</h4>
            </div>
            <p className="text-[11px] text-zinc-500">Select or drop a backup JSON file.</p>
            <label className="mt-auto inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700">
              <span>Select file</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="border-t border-white/10 pt-3 text-center">
          <button
            type="button"
            onClick={onResetDefaults}
            className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:underline"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset to default references</span>
          </button>
        </div>
      </div>
    </div>
  );
}
