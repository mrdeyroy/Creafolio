import React, { useState, useEffect } from "react";
import { PortfolioItem, MigrationSummary } from "@/types";
import {
  migrateLocalDataToSupabase,
  exportPortfoliosToJson,
} from "@/lib/portfolio-service";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  X,
  Database,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Loader2,
  HardDrive,
  ArrowRight,
} from "lucide-react";

interface DataMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminItems: PortfolioItem[];
  onRefreshData: () => Promise<void>;
  onShowToast: (msg: string) => void;
}

export function DataMigrationModal({
  isOpen,
  onClose,
  adminItems,
  onRefreshData,
  onShowToast,
}: DataMigrationModalProps) {
  const [localVaultCount, setLocalVaultCount] = useState<number>(0);
  const [localItems, setLocalItems] = useState<PortfolioItem[]>([]);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<MigrationSummary | null>(null);
  const [migrationError, setMigrationError] = useState<string | null>(null);

  // Inspect browser localStorage for legacy data
  useEffect(() => {
    if (!isOpen) return;

    try {
      const v2 = localStorage.getItem("creafolio_vault_v2");
      const master = localStorage.getItem("creafolio_vault_master");
      const raw = v2 || master;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setLocalItems(parsed);
          setLocalVaultCount(parsed.length);
          return;
        }
      }
    } catch {
      // Ignore parse error
    }
    setLocalVaultCount(0);
    setLocalItems([]);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartMigration = async () => {
    if (!isSupabaseConfigured()) {
      setMigrationError("Supabase is not configured. Add credentials in .env first.");
      return;
    }
    if (localItems.length === 0) {
      setMigrationError("No local items detected to migrate.");
      return;
    }

    setIsMigrating(true);
    setMigrationError(null);
    setMigrationResult(null);

    try {
      const result = await migrateLocalDataToSupabase(localItems);
      setMigrationResult(result);
      await onRefreshData();
      onShowToast(`Migrated ${result.added} items to Supabase`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Migration failed";
      setMigrationError(message);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setIsMigrating(true);
          const result = await migrateLocalDataToSupabase(parsed);
          setMigrationResult(result);
          await onRefreshData();
          onShowToast(`Imported ${result.added} items from JSON`);
        } else {
          setMigrationError("JSON file must contain an array of portfolio items.");
        }
      } catch {
        setMigrationError("Invalid JSON file format.");
      } finally {
        setIsMigrating(false);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-zinc-900 p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-zinc-800 text-zinc-200">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Data Migration & Sync
              </h3>
              <p className="text-xs text-zinc-400">
                Transfer local bookmarks to Supabase and export backups.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Status / Errors */}
        {migrationError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{migrationError}</span>
          </div>
        )}

        {migrationResult && (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-200">
            <div className="flex items-center gap-2 font-semibold text-emerald-300 mb-1.5">
              <CheckCircle className="h-4 w-4" />
              <span>Migration Completed Successfully</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center pt-2 border-t border-emerald-500/20 font-mono text-[11px]">
              <div>
                <span className="block text-emerald-400 font-bold">{migrationResult.total}</span>
                <span className="text-zinc-400 text-[10px]">Scanned</span>
              </div>
              <div>
                <span className="block text-emerald-300 font-bold">{migrationResult.added}</span>
                <span className="text-zinc-400 text-[10px]">Added</span>
              </div>
              <div>
                <span className="block text-amber-300 font-bold">{migrationResult.skipped}</span>
                <span className="text-zinc-400 text-[10px]">Duplicates</span>
              </div>
              <div>
                <span className="block text-red-400 font-bold">{migrationResult.errors}</span>
                <span className="text-zinc-400 text-[10px]">Errors</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Section 1: LocalStorage Vault Migration */}
          <div className="rounded-xl border border-white/10 bg-zinc-950/70 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <HardDrive className="h-5 w-5 text-zinc-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-zinc-200">
                    Browser LocalStorage Vault
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {localVaultCount > 0 ? (
                      <>
                        Found <strong className="text-zinc-200">{localVaultCount} items</strong> in your browser cache.
                      </>
                    ) : (
                      "No un-migrated items found in this browser's local cache."
                    )}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleStartMigration}
                disabled={isMigrating || localVaultCount === 0}
                className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-950 transition hover:bg-white disabled:opacity-40"
              >
                {isMigrating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="h-3.5 w-3.5" />
                )}
                <span>Migrate to DB</span>
              </button>
            </div>
          </div>

          {/* Section 2: JSON Backup Import & Export */}
          <div className="grid grid-cols-2 gap-3">
            {/* Import JSON */}
            <div className="rounded-xl border border-white/10 bg-zinc-950/70 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-zinc-200 font-semibold text-xs mb-1">
                  <Upload className="h-4 w-4 text-zinc-400" />
                  <span>Import JSON Backup</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Upload an existing Creafolio JSON export file. Duplicate URLs will be skipped.
                </p>
              </div>
              <label className="mt-3 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 transition">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJsonFile}
                  className="hidden"
                />
                <span>Select JSON File</span>
              </label>
            </div>

            {/* Export JSON */}
            <div className="rounded-xl border border-white/10 bg-zinc-950/70 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-zinc-200 font-semibold text-xs mb-1">
                  <Download className="h-4 w-4 text-zinc-400" />
                  <span>Export Database</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Download a complete JSON snapshot of all {adminItems.length} references.
                </p>
              </div>
              <button
                type="button"
                onClick={() => exportPortfoliosToJson(adminItems)}
                className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-5 border-t border-white/10 pt-3 text-[11px] text-zinc-500">
          Note: Local data is left intact as a safety backup. Duplicates are recognized by normalized URL.
        </div>
      </div>
    </div>
  );
}
