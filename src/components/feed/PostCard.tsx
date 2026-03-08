import { useState } from "react";
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

  if (!user) return null;

  const isCurrentUser = (uid: string) => uid === user.uid;
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

    if (!trimmed || trimmed === post.content) {
      setEditing(false);
      return;
    }

    setSaving(true);

    try {
      await updatePost(post.id, trimmed);
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

      {/* MEDIA */}

      {!editing && post.media && post.media.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {post.media.map((media: any, index: number) => {
            const url = typeof media === "string" ? media : media?.url;

            if (!url) return null;

            const optimizedUrl = url.includes("/upload/")
              ? url.replace("/upload/", "/upload/f_auto,q_auto/")
              : url;

            return (
              <img
                key={index}
                src={optimizedUrl}
                alt="post"
                loading="lazy"
                className="w-full max-h-96 object-cover rounded-xl"
              />
            );
          })}
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
                {showLikes ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}

                {showLikes ? "Ocultar" : "Ver likes"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
