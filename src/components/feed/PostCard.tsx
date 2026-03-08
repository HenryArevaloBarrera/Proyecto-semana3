import { useState, useRef, ChangeEvent } from "react";
import { useAuth } from "../../context/useAuth";
import { toggleLike, updatePost } from "../../services/post.service";
import type { Post } from "../../types/post";
import {
  Heart,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "ahora";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days}d`;
  return date.toLocaleDateString("es");
}

interface PostCardProps {
  post: Post;
  deleting: boolean;
  onDelete: (id: string) => void;
}

export default function PostCard({ post, deleting, onDelete }: PostCardProps) {
  const { user } = useAuth();

  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [saving, setSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [liking, setLiking] = useState(false);
  const [showLikes, setShowLikes] = useState(false);

  // Para el carrusel
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  // Para edición de imágenes
  const [editMedia, setEditMedia] = useState(post.media || []);

  if (!user) return null;

  const isAuthor = user.uid === post.author.uid;
  const likes = post.likes ?? [];
  const isLiked = likes.some((l) => l.uid === user.uid);
  const likeCount = likes.length;
  const createdAt = post.createdAt?.toDate?.() ?? new Date();

  const handleLike = async () => {
    setLiking(true);
    try {
      await toggleLike(post.id, likes, {
        uid: user.uid,
        displayName: user.displayName || "Anónimo",
        photoURL: user.photoURL,
      });
    } catch (e) {
      console.error("Error al dar like:", e);
    } finally {
      setLiking(false);
    }
  };

  const handleSave = async () => {
    const trimmed = editContent.trim();
    if (!trimmed || (trimmed === post.content && editMedia === post.media)) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await updatePost(post.id, trimmed, editMedia);
      setEditing(false);
    } catch (e) {
      console.error("Error al editar post:", e);
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const authorInitials = getInitials(post.author.displayName || "?");

  // Carrusel
  const nextImage = () => {
    if (editMedia.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % editMedia.length);
  };
  const prevImage = () => {
    if (editMedia.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + editMedia.length) % editMedia.length);
  };
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) nextImage();
    else if (diff < -50) prevImage();
    touchStartX.current = null;
  };

  // Editar imágenes
  const handleRemoveImage = (index: number) => {
    setEditMedia((prev) => prev.filter((_, i) => i !== index));
    if (currentIndex >= editMedia.length - 1) setCurrentIndex(editMedia.length - 2 >= 0 ? editMedia.length - 2 : 0);
  };

  const handleAddImages = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 5 - editMedia.length); // max 5
    const newUrls = files.map((file) => URL.createObjectURL(file));
    setEditMedia((prev) => [...prev, ...newUrls]);
    e.target.value = "";
  };

  return (
    <div
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 transition hover:border-white/15
        ${deleting ? "opacity-50 pointer-events-none" : ""}`}
    >
      {/* HEADER */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {post.author.photoURL ? (
            <img
              src={post.author.photoURL}
              alt={post.author.displayName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white ring-2 ring-white/10">
              {authorInitials}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-white">
              {post.author.displayName || "Anónimo"}
            </p>
            <p className="text-xs text-slate-500">{timeAgo(createdAt)}</p>
          </div>
        </div>

        {isAuthor && !editing && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setEditing(true);
                setEditContent(post.content);
                setEditMedia(post.media || []);
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>

            {confirmDelete ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setConfirmDelete(false);
                    onDelete(post.id);
                  }}
                  className="p-1.5 rounded-lg bg-red-500/20 text-red-400"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* CONTENIDO */}
      {editing ? (
        <div className="mb-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white resize-none"
          />
          {/* Editar imágenes */}
          <div className="mt-3 mb-2 grid grid-cols-3 gap-2">
            {editMedia.map((url, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={url}
                  alt={`edit-${idx}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 bg-red-500/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {editMedia.length < 5 && (
              <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-white/20 rounded-lg cursor-pointer text-white/50 hover:text-white/80 hover:border-white/40">
                + Añadir
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleAddImages}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setEditing(false)}
              className="text-xs text-slate-400"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !editContent.trim()}
              className="text-xs text-white bg-blue-600 px-3 py-1.5 rounded-lg"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-200 leading-relaxed mb-4 whitespace-pre-wrap">
          {post.content}
        </p>
      )}

      {/* CARRUSEL TIPO IG */}
      {!editing && editMedia.length > 0 && (
        <div
          className="relative w-full max-h-96 overflow-hidden rounded-xl mb-4"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={editMedia[currentIndex]}
            alt={`post-${currentIndex}`}
            className="w-full max-h-96 object-cover rounded-xl transition-transform duration-300"
          />
          {/* Botones */}
          {editMedia.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/30 text-white p-1 rounded-full hover:bg-black/50 hidden md:flex"
              >
                &#8249;
              </button>
              <button
                onClick={nextImage}
                className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/30 text-white p-1 rounded-full hover:bg-black/50 hidden md:flex"
              >
                &#8250;
              </button>
            </>
          )}
          {/* Indicadores */}
          {editMedia.length > 1 && (
            <div className="absolute bottom-2 w-full flex justify-center gap-1">
              {editMedia.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-2 h-2 rounded-full ${
                    idx === currentIndex ? "bg-white" : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* LIKES */}
      {!editing && (
        <div className="pt-3 border-t border-white/5">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              disabled={liking}
              className={`flex items-center gap-1.5 text-sm
              ${isLiked ? "text-rose-400" : "text-slate-500 hover:text-rose-400"}`}
            >
              {liking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Heart
                  className={`w-4 h-4 ${isLiked ? "fill-rose-400" : ""}`}
                />
              )}
              <span className="text-xs font-medium">
                {likeCount > 0 ? likeCount : ""}
              </span>
            </button>

            {likeCount > 0 && (
              <button
                onClick={() => setShowLikes(!showLikes)}
                className="flex items-center gap-1 text-xs text-slate-500"
              >
                {showLikes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {showLikes ? "Ocultar" : "Ver likes"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
