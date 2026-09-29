import React, { useState, useEffect } from "react";
import { PortfolioItem } from "@/types";
import { X, RefreshCw, Loader2, Bookmark, Eye } from "lucide-react";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<PortfolioItem>) => void;
  editingItem: PortfolioItem | null;
  onFetchMeta: (url: string) => Promise<{
    title: string;
    description: string;
    image: string;
    category: string;
  }>;
}

export function EditModal({
  isOpen,
  onClose,
  onSave,
  editingItem,
  onFetchMeta,
}: EditModalProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Portfolios");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [pinned, setPinned] = useState(false);
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setUrl(editingItem.url || "");
      setTitle(editingItem.title || "");
      setCategory(editingItem.category || "Portfolios");
      setImage(editingItem.image || "");
      setDescription(editingItem.description || "");
      setTags((editingItem.tags || []).join(", "));
      setPinned(Boolean(editingItem.pinned));
      setPublished(editingItem.published !== undefined ? Boolean(editingItem.published) : true);
    } else {
      setUrl("");
      setTitle("");
      setCategory("Portfolios");
      setImage("");
      setDescription("");
      setTags("Portfolios");
      setPinned(false);
      setPublished(true);
    }
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleRefetch = async () => {
    if (!url.trim() || loading) return;
    setLoading(true);
    try {
      const meta = await onFetchMeta(url.trim());
      setTitle(meta.title);
      setDescription(meta.description);
      setImage(meta.image);
      setCategory(meta.category);
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawTags = tags.split(",").map((t) => t.trim()).filter(Boolean);
    onSave({
      id: editingItem?.id,
      url: url.trim(),
      title: title.trim() || url.trim(),
      category,
      image: image.trim(),
      description: description.trim(),
      tags: rawTags.length > 0 ? rawTags : [category],
      pinned,
      published,
    });
    onClose();
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
          <h3 className="text-base font-semibold text-white">
            {editingItem ? "Edit Reference" : "Add Reference"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs">
          <div>
            <label className="mb-1 block font-medium text-zinc-300">URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                placeholder="https://..."
                className="flex-1 rounded-lg border border-white/10 bg-zinc-950 px-3 py-1.5 text-zinc-100 outline-none focus:border-white/30"
              />
              <button
                type="button"
                onClick={handleRefetch}
                disabled={loading}
                className="inline-flex items-center gap-1 rounded-lg bg-zinc-800 px-3 py-1.5 font-medium text-zinc-200 hover:bg-zinc-700 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                <span>Fetch</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block font-medium text-zinc-300">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Creator / Project Name"
                className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-1.5 text-zinc-100 outline-none focus:border-white/30"
              />
            </div>
            <div>
              <label className="mb-1 block font-medium text-zinc-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-zinc-950 px-2 py-1.5 text-zinc-100 outline-none focus:border-white/30"
              >
                <option value="Portfolios">Portfolios</option>
                <option value="UI & Components">UI & Components</option>
                <option value="Inspiration">Inspiration</option>
                <option value="Tools & Resources">Tools & Resources</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block font-medium text-zinc-300">Thumbnail URL</label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-1.5 text-zinc-100 outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium text-zinc-300">Notes / Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief note about this site..."
              className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-1.5 text-zinc-100 outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium text-zinc-300">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Minimal, 3D, Editorial"
              className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-1.5 text-zinc-100 outline-none focus:border-white/30"
            />
          </div>

          {/* Visibility and Featured flags */}
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-zinc-950/60 p-2.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-white/20 bg-zinc-900 text-white accent-white"
              />
              <span className="flex items-center gap-1 text-zinc-300">
                <Eye className="h-3 w-3 text-emerald-400" />
                <span>Published (Public)</span>
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-white/20 bg-zinc-900 text-white accent-amber-400"
              />
              <span className="flex items-center gap-1 text-zinc-300">
                <Bookmark className="h-3 w-3 text-amber-400" />
                <span>Featured / Pinned</span>
              </span>
            </label>
          </div>

          <div className="mt-2 flex justify-end gap-2 border-t border-white/10 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 font-medium text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-white px-4 py-1.5 font-semibold text-zinc-950 hover:bg-zinc-200"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
