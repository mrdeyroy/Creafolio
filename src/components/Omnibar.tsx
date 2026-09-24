import React, { useState } from "react";
import { Link2, Clipboard, ArrowRight, Loader2 } from "lucide-react";

interface OmnibarProps {
  onAddUrl: (url: string) => Promise<void>;
  onShowToast: (msg: string) => void;
}

export function Omnibar({ onAddUrl, onShowToast }: OmnibarProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || loading) return;
    setLoading(true);
    try {
      await onAddUrl(url.trim());
      setUrl("");
    } catch {
      onShowToast("Error retrieving metadata");
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      if (navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrl(text.trim());
          onShowToast("Pasted from clipboard");
        }
      }
    } catch {
      // Ignore clipboard read error
    }
  };

  return (
    <section className="mx-auto mb-6 w-full max-w-[640px]">
      <form
        onSubmit={handleSubmit}
        className="flex w-full items-center rounded-xl border border-white/10 bg-zinc-900/80 px-3 py-1.5 shadow-lg backdrop-blur-md transition-all focus-within:border-white/30 focus-within:ring-2 focus-within:ring-white/5"
      >
        <div className="mr-2 flex items-center text-zinc-500">
          <Link2 className="h-4 w-4" />
        </div>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste portfolio or UI library URL..."
          required
          autoComplete="off"
          inputMode="url"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none"
        />
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePaste}
            title="Paste from clipboard"
            className="inline-flex items-center gap-1 rounded bg-zinc-800/80 px-2 py-1 font-mono text-[11px] font-medium text-zinc-400 transition hover:bg-zinc-700 hover:text-zinc-200"
          >
            <Clipboard className="h-3 w-3" />
            <span>Paste</span>
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-950 transition hover:bg-white disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ArrowRight className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
