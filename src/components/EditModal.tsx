import React, { useState, useEffect } from "react";
import { PortfolioItem, Collection } from "@/types";
import {
  X,
  RefreshCw,
  Loader2,
  Bookmark,
  Eye,
  Check,
  Video,
  Image as ImageIcon,
  Play,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { DEFAULT_COLLECTIONS } from "@/lib/portfolio-service";
import { validateAndSanitizeUrl, isSafeMediaUrl } from "@/lib/url-security";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<PortfolioItem>, collectionIds: string[]) => void;
  editingItem: PortfolioItem | null;
  collections?: Collection[];
  onFetchMeta: (url: string) => Promise<{
    title: string;
    description: string;
    image: string;
    video?: string;
    category?: string;
    guessedCollections?: string[];
  }>;
}

export function EditModal({
  isOpen,
  onClose,
  onSave,
  editingItem,
  collections = DEFAULT_COLLECTIONS,
  onFetchMeta,
}: EditModalProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);
  const [image, setImage] = useState("");
  const [video, setVideo] = useState("");
  const [previewType, setPreviewType] = useState<"image" | "video">("image");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [pinned, setPinned] = useState(false);
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [videoStatus, setVideoStatus] = useState<"idle" | "ready" | "error">("idle");
  const [showVideoTest, setShowVideoTest] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const availableCollections =
    collections && collections.length > 0 ? collections : DEFAULT_COLLECTIONS;

  useEffect(() => {
    setValidationError(null);
    if (editingItem) {
      setUrl(editingItem.url || "");
      setTitle(editingItem.title || "");
      setImage(editingItem.image || "");
      setVideo(editingItem.video || "");
      setPreviewType(editingItem.previewType || (editingItem.video ? "video" : "image"));
      setDescription(editingItem.description || "");
      setTags((editingItem.tags || []).join(", "));
      setPinned(Boolean(editingItem.pinned));
      setPublished(editingItem.published !== undefined ? Boolean(editingItem.published) : true);
      setVideoStatus("idle");
      setShowVideoTest(false);

      // Determine initial collection IDs
      if (editingItem.collections && editingItem.collections.length > 0) {
        const ids: string[] = [];
        for (const ec of editingItem.collections) {
          const match = availableCollections.find(
            (ac) =>
              ac.id === ec.id ||
              (ec.slug && ac.slug === ec.slug) ||
              (ec.name && ac.name.toLowerCase() === ec.name.toLowerCase())
          );
          if (match && !ids.includes(match.id)) {
            ids.push(match.id);
          } else if (ec.id && !ids.includes(ec.id)) {
            ids.push(ec.id);
          }
        }
        setSelectedCollectionIds(
          ids.length > 0
            ? ids
            : availableCollections[0]
            ? [availableCollections[0].id]
            : []
        );
      } else if (editingItem.collection_ids && editingItem.collection_ids.length > 0) {
        const ids: string[] = [];
        for (const cid of editingItem.collection_ids) {
          const match = availableCollections.find(
            (ac) => ac.id === cid || ac.slug === cid
          );
          if (match && !ids.includes(match.id)) {
            ids.push(match.id);
          } else if (!ids.includes(cid)) {
            ids.push(cid);
          }
        }
        setSelectedCollectionIds(
          ids.length > 0
            ? ids
            : availableCollections[0]
            ? [availableCollections[0].id]
            : []
        );
      } else {
        setSelectedCollectionIds(availableCollections[0] ? [availableCollections[0].id] : []);
      }
    } else {
      setUrl("");
      setTitle("");
      setImage("");
      setVideo("");
      setPreviewType("image");
      setDescription("");
      setTags("Design");
      setPinned(false);
      setPublished(true);
      setVideoStatus("idle");
      setShowVideoTest(false);
      setSelectedCollectionIds(availableCollections[0] ? [availableCollections[0].id] : []);
    }
  }, [editingItem, isOpen, availableCollections]);

  if (!isOpen) return null;

  const handleToggleCollection = (colId: string) => {
    setSelectedCollectionIds((prev) => {
      if (prev.includes(colId)) {
        return prev.filter((id) => id !== colId);
      } else {
        return [...prev, colId];
      }
    });
  };

  const handleRefetch = async () => {
    if (!url.trim() || loading) return;
    setValidationError(null);

    const validated = validateAndSanitizeUrl(url.trim());
    if (!validated.isValid || !validated.sanitizedUrl) {
      setValidationError(validated.error || "Please enter a valid website address.");
      return;
    }

    setLoading(true);
    setVideoStatus("idle");
    try {
      const meta = await onFetchMeta(validated.sanitizedUrl);
      setUrl(validated.sanitizedUrl);
      setTitle(meta.title);
      setDescription(meta.description);
      setImage(meta.image);
      if (meta.video) {
        setVideo(meta.video);
        setPreviewType("video");
      }

      const toMatch = meta.guessedCollections && meta.guessedCollections.length > 0
        ? meta.guessedCollections
        : meta.category
        ? [meta.category]
        : [];

      if (toMatch.length > 0) {
        const guessedIds: string[] = [];
        for (const name of toMatch) {
          const matched = availableCollections.find(
            (c) =>
              c.name.toLowerCase() === name.toLowerCase() ||
              c.slug.toLowerCase() === name.toLowerCase()
          );
          if (matched && !guessedIds.includes(matched.id)) {
            guessedIds.push(matched.id);
          }
        }
        if (guessedIds.length > 0) {
          setSelectedCollectionIds(guessedIds);
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate main URL
    const validated = validateAndSanitizeUrl(url);
    if (!validated.isValid || !validated.sanitizedUrl) {
      setValidationError(validated.error || "Please enter a valid URL.");
      return;
    }

    // Validate optional image URL
    if (image.trim() && !isSafeMediaUrl(image.trim())) {
      setValidationError("Thumbnail URL must be a valid http:// or https:// address.");
      return;
    }

    // Validate optional video URL
    if (previewType === "video" && video.trim() && !isSafeMediaUrl(video.trim())) {
      setValidationError("Video URL must be a valid http:// or https:// stream address.");
      return;
    }

    const rawTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // Fallback: at least one collection
    const finalCollectionIds =
      selectedCollectionIds.length > 0
        ? selectedCollectionIds
        : availableCollections[0]
        ? [availableCollections[0].id]
        : [];

    onSave(
      {
        id: editingItem?.id,
        url: validated.sanitizedUrl,
        title: title.trim() || validated.domain || "Untitled",
        image: image.trim(),
        video: video.trim() || null,
        previewType,
        description: description.trim(),
        tags: rawTags.length > 0 ? rawTags : ["Design"],
        pinned,
        published,
      },
      finalCollectionIds
    );
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-xl border border-white/15 bg-zinc-900 p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="text-base font-semibold text-white">
              {editingItem ? "Edit Reference" : "Add Reference"}
            </h3>
            <p className="text-xs text-zinc-400">
              Assign to one or more collections to help visitors discover this resource.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {validationError && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs">
          {/* URL Input with Fetch button */}
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

          {/* Title */}
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

          {/* Collections Checkbox List */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="font-medium text-zinc-300">
                Collections ({selectedCollectionIds.length} selected)
              </label>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedCollectionIds(availableCollections.map((c) => c.id))
                  }
                  className="text-zinc-400 hover:text-zinc-200 transition underline underline-offset-2"
                >
                  Select all
                </button>
                <span className="text-zinc-600">•</span>
                <button
                  type="button"
                  onClick={() => setSelectedCollectionIds([])}
                  className="text-zinc-400 hover:text-amber-400 transition underline underline-offset-2"
                >
                  Clear all
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 rounded-lg border border-white/10 bg-zinc-950/70 p-2.5 max-h-40 overflow-y-auto">
              {availableCollections.map((col) => {
                const isSelected = selectedCollectionIds.includes(col.id);
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => handleToggleCollection(col.id)}
                    className={`flex items-center gap-2 cursor-pointer select-none rounded-md px-2.5 py-1.5 text-left transition ${
                      isSelected
                        ? "bg-amber-500/15 text-amber-200 font-medium border border-amber-500/40 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                        isSelected
                          ? "border-amber-400 bg-amber-400 text-zinc-950"
                          : "border-zinc-700 bg-zinc-900 group-hover:border-zinc-500"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <span className="truncate text-xs">{col.name}</span>
                  </button>
                );
              })}
            </div>
            {selectedCollectionIds.length === 0 && (
              <p className="mt-1 text-[11px] text-amber-400">
                Please select at least one collection for this resource.
              </p>
            )}
          </div>

          {/* Preview Type & Media Options */}
          <div className="rounded-lg border border-white/10 bg-zinc-950/70 p-3 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-zinc-300">Card Preview Mode</span>
              <div className="flex rounded-lg bg-zinc-900 p-0.5 border border-white/10">
                <button
                  type="button"
                  onClick={() => setPreviewType("image")}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                    previewType === "image"
                      ? "bg-white text-zinc-950 shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <ImageIcon className="h-3 w-3" />
                  <span>Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewType("video")}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                    previewType === "video"
                      ? "bg-amber-400 text-zinc-950 shadow-sm font-semibold"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Video className="h-3 w-3" />
                  <span>Video</span>
                </button>
              </div>
            </div>

            {/* Thumbnail Image URL */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="font-medium text-zinc-300">
                  {previewType === "video" ? "Fallback / Poster Screenshot URL" : "Screenshot Thumbnail URL"}
                </label>
                {previewType === "video" && (
                  <span className="text-[10px] text-zinc-400">Used as poster & safe fallback</span>
                )}
              </div>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-1.5 text-zinc-100 outline-none focus:border-white/30"
              />
            </div>

            {/* Video Preview URL & Live Test */}
            {previewType === "video" && (
              <div className="flex flex-col gap-2 rounded-lg border border-amber-500/20 bg-amber-950/10 p-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-amber-300 flex items-center gap-1.5">
                    <Video className="h-3.5 w-3.5" />
                    <span>Video Preview Stream / MP4 URL</span>
                  </label>
                  {video && (
                    <button
                      type="button"
                      onClick={() => {
                        setVideo("");
                        setVideoStatus("idle");
                        setShowVideoTest(false);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Clear video</span>
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={video}
                    onChange={(e) => {
                      setVideo(e.target.value);
                      setVideoStatus("idle");
                    }}
                    placeholder="https://... (.mp4, .webm, or video stream)"
                    className="flex-1 rounded-lg border border-white/10 bg-zinc-900 px-3 py-1.5 text-zinc-100 outline-none focus:border-amber-400/50"
                  />
                  {video.trim() && (
                    <button
                      type="button"
                      onClick={() => setShowVideoTest(!showVideoTest)}
                      className="inline-flex items-center gap-1 rounded-lg bg-zinc-800 px-2.5 py-1.5 font-medium text-zinc-200 hover:bg-zinc-700 transition shrink-0"
                    >
                      <Play className="h-3 w-3 text-amber-400" />
                      <span>{showVideoTest ? "Hide Test" : "Test Video"}</span>
                    </button>
                  )}
                </div>

                {/* Inline video test preview */}
                {showVideoTest && video.trim() && (
                  <div className="mt-1 flex flex-col gap-1.5">
                    <div className="relative aspect-video w-full overflow-hidden rounded-md border border-white/10 bg-black">
                      <video
                        src={video.trim()}
                        poster={image || undefined}
                        controls
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover"
                        onLoadedData={() => setVideoStatus("ready")}
                        onError={() => setVideoStatus("error")}
                      />
                    </div>
                    {videoStatus === "ready" && (
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Video playable & ready for hover previews!</span>
                      </div>
                    )}
                    {videoStatus === "error" && (
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-400">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>
                          Cannot play stream directly. If saved, Creafolio will safely fall back to the image.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description */}
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

          {/* Tags */}
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

          {/* Modal Actions */}
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
