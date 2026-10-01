import React, { useState } from "react";
import { Collection, PortfolioItem } from "@/types";
import {
  createCollection,
  updateCollection,
  deleteCollection,
  reorderCollections,
  normalizeStandardCollectionsInSupabase,
} from "@/lib/portfolio-service";
import {
  X,
  Plus,
  Trash2,
  Pencil,
  Check,
  ChevronUp,
  ChevronDown,
  Layers,
  FolderKanban,
  AlertTriangle,
  Loader2,
  Sparkles,
} from "lucide-react";

interface ManageCollectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  collections: Collection[];
  items: PortfolioItem[];
  onRefreshCollections: () => Promise<void>;
  onRefreshData: () => Promise<void>;
  onShowToast: (msg: string) => void;
}

export function ManageCollectionsModal({
  isOpen,
  onClose,
  collections,
  items,
  onRefreshCollections,
  onRefreshData,
  onShowToast,
}: ManageCollectionsModalProps) {
  // New collection form state
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Edit collection state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Deleting state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isNormalizing, setIsNormalizing] = useState(false);

  const handleNormalize = async () => {
    setIsNormalizing(true);
    try {
      const res = await normalizeStandardCollectionsInSupabase();
      await onRefreshCollections();
      await onRefreshData();
      onShowToast(
        res.updated > 0 || res.removed > 0
          ? `Collections synced (${res.updated} re-linked, ${res.removed} cleaned)`
          : "Collections already perfectly aligned with 10 standards"
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sync collections";
      onShowToast(msg);
    } finally {
      setIsNormalizing(false);
    }
  };

  if (!isOpen) return null;

  // Calculate resource count per collection
  const getItemCountForCollection = (col: Collection) => {
    return items.filter((item) =>
      (item.collections || []).some(
        (c) =>
          c.id === col.id ||
          c.slug.toLowerCase() === col.slug.toLowerCase() ||
          c.name.toLowerCase() === col.name.toLowerCase()
      )
    ).length;
  };

  // Create Collection
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await createCollection(newName.trim(), newDescription.trim());
      setNewName("");
      setNewDescription("");
      await onRefreshCollections();
      await onRefreshData();
      onShowToast(`Created collection: ${newName.trim()}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create collection";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start editing
  const handleStartEdit = (col: Collection) => {
    setEditingId(col.id);
    setEditName(col.name);
    setEditDescription(col.description || "");
  };

  // Save edit
  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    setIsSubmitting(true);
    try {
      await updateCollection(id, {
        name: editName.trim(),
        description: editDescription.trim(),
      });
      setEditingId(null);
      await onRefreshCollections();
      await onRefreshData();
      onShowToast(`Updated collection: ${editName.trim()}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update collection";
      onShowToast(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reorder collection
  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= collections.length) return;

    const reordered = [...collections];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const orderedIds = reordered.map((c) => c.id);
    try {
      await reorderCollections(orderedIds);
      await onRefreshCollections();
    } catch {
      onShowToast("Failed to reorder collections");
    }
  };

  // Delete collection
  const handleDelete = async (col: Collection) => {
    const count = getItemCountForCollection(col);
    const confirmPrompt = count > 0
      ? `Permanently delete collection "${col.name}"? It currently contains ${count} resource(s). The resources themselves will NOT be deleted.`
      : `Delete collection "${col.name}"?`;

    if (!window.confirm(confirmPrompt)) return;

    setDeletingId(col.id);
    try {
      await deleteCollection(col.id);
      await onRefreshCollections();
      await onRefreshData();
      onShowToast(`Deleted collection: ${col.name}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete collection";
      onShowToast(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-white/15 bg-zinc-900 shadow-2xl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-zinc-800 text-amber-400">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Manage Collections</h3>
              <p className="text-xs text-zinc-400">
                Organize resources into single or multiple collections.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Create Collection Card */}
          <form
            onSubmit={handleCreate}
            className="rounded-xl border border-white/10 bg-zinc-950/70 p-4"
          >
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-3 flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5 text-amber-400" />
              <span>Create New Collection</span>
            </h4>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-zinc-400">
                  Collection Name *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Landing Pages"
                  required
                  className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-zinc-400">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="e.g. High converting SaaS pages"
                  className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 outline-none focus:border-white/30"
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !newName.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-40"
              >
                {isSubmitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
                <span>Add Collection</span>
              </button>
            </div>
          </form>

          {/* Existing Collections List */}
          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-300">
                  Active Collections ({collections.length})
                </span>
                <button
                  type="button"
                  onClick={handleNormalize}
                  disabled={isNormalizing}
                  title="Ensure exactly the 10 standard collections exist and safely reassign deprecated ones"
                  className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-zinc-800/80 px-2 py-0.5 text-[11px] font-medium text-zinc-300 transition hover:border-amber-500/40 hover:text-amber-300 disabled:opacity-50"
                >
                  {isNormalizing ? (
                    <Loader2 className="h-3 w-3 animate-spin text-amber-400" />
                  ) : (
                    <Sparkles className="h-3 w-3 text-amber-400" />
                  )}
                  <span>Align 10 Standards</span>
                </button>
              </div>
              <span className="text-[11px] text-zinc-500">Reorder & manage below</span>
            </div>

            <div className="space-y-2">
              {collections.map((col, idx) => {
                const count = getItemCountForCollection(col);
                const isEditing = editingId === col.id;
                const isDeleting = deletingId === col.id;

                return (
                  <div
                    key={col.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/10 bg-zinc-950/60 p-3.5 transition hover:border-white/20"
                  >
                    {isEditing ? (
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            required
                            className="flex-1 rounded-lg border border-white/20 bg-zinc-900 px-2.5 py-1 text-xs text-white outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(col.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Save</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded-lg px-2 py-1 text-xs text-zinc-400 hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Collection description"
                          className="w-full rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-300 outline-none"
                        />
                      </div>
                    ) : (
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
                          <Layers className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-zinc-100">
                              {col.name}
                            </span>
                            <span className="rounded-full bg-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-400 border border-white/5">
                              {count} resource{count === 1 ? "" : "s"}
                            </span>
                          </div>
                          {col.description && (
                            <p className="mt-0.5 text-xs text-zinc-400 truncate max-w-sm">
                              {col.description}
                            </p>
                          )}
                          <div className="mt-0.5 font-mono text-[10px] text-zinc-500">
                            slug: {col.slug}
                          </div>
                        </div>
                      </div>
                    )}

                    {!isEditing && (
                      <div className="flex items-center justify-end gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        {/* Reorder Buttons */}
                        <div className="flex items-center rounded-lg border border-white/10 bg-zinc-900/80 p-0.5">
                          <button
                            type="button"
                            onClick={() => handleMove(idx, "up")}
                            disabled={idx === 0}
                            title="Move up in order"
                            className="rounded p-1 text-zinc-400 hover:text-white disabled:opacity-30"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(idx, "down")}
                            disabled={idx === collections.length - 1}
                            title="Move down in order"
                            className="rounded p-1 text-zinc-400 hover:text-white disabled:opacity-30"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleStartEdit(col)}
                          title="Rename / Edit collection"
                          className="rounded-lg border border-white/10 bg-zinc-900/80 p-1.5 text-zinc-400 transition hover:border-white/20 hover:text-white"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDelete(col)}
                          disabled={isDeleting}
                          title="Delete collection"
                          className="rounded-lg border border-white/10 bg-zinc-900/80 p-1.5 text-zinc-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-white/10 p-4 text-xs text-zinc-500">
          <span>Resources can belong to multiple collections simultaneously.</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-zinc-800 px-3.5 py-1.5 font-medium text-zinc-200 hover:bg-zinc-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
