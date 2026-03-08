import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import { toggleLike, updatePost, updatePostMedia } from "../../services/post.service";
import type { Post, LikeInfo, MediaItem } from "../../types/post";
import {
  Heart,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  X as XIcon,
  ImagePlus,
} from "lucide-react";
import { uploadToCloudinary } from "../../services/cloudinary.service";
import imageCompression from "browser-image-compression";

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

  const [showImageModal, setShowImageModal] = useState(false);
  const [editMedia, setEditMedia] = useState<MediaItem[]>(post.media || []);
  const [newFiles, setNewFiles] = useState<(File | null)[]>(Array(5).fill(null));
  const [mediaToDelete, setMediaToDelete] = useState<string[]>([]);

  if (!user) return null;

  const isAuthor = user.uid === post.author.uid;

  const likes: LikeInfo[] = post.likes ?? [];
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

  const uploadFiles = async (files: File[]): Promise<MediaItem[]> => {

    const uploads = await Promise.all(

      files.map(async (file) => {

        let processedFile = file;

        if (file.type.startsWith("image")) {

          processedFile = await imageCompression(file, {
            maxSizeMB: 0.7,
            maxWidthOrHeight: 1920,
            useWebWorker: true
          });

        }

        return await uploadToCloudinary(processedFile);

      })

    );

    return uploads;

  };

  const handleSaveImages = async () => {

    const filesToUpload = newFiles.filter((file): file is File => file !== null);

    setSaving(true);

    try {

      if (editContent !== post.content) {
        await updatePost(post.id, editContent);
      }

      let uploadedMedia: MediaItem[] = [];

      if (filesToUpload.length > 0) {
        uploadedMedia = await uploadFiles(filesToUpload);
      }

      const remainingMedia = editMedia.filter(
        (m) => !mediaToDelete.includes((m as any).url)
      );

      const finalMedia = [...remainingMedia, ...uploadedMedia].slice(0, 5);

      if (mediaToDelete.length > 0 || filesToUpload.length > 0) {
        await updatePostMedia(post.id, finalMedia);
      }

      setShowImageModal(false);
      setEditMedia(finalMedia);
      setNewFiles(Array(5).fill(null));
      setMediaToDelete([]);

    } catch (e) {

      console.error("Error al editar publicación:", e);

    } finally {

      setSaving(false);

    }

  };

  const handleFileSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];
    if (!file) return;

    const totalFiles = editMedia.length + newFiles.filter(f => f !== null).length;

    if (totalFiles >= 5) {
      alert("Máximo 5 archivos en total");
      return;
    }

    setNewFiles(prev => {
      const updated = [...prev];
      updated[index] = file;
      return updated;
    });

  };

  const handleRemoveExistingMedia = (index: number) => {

    const mediaItem: any = editMedia[index];

    const url = typeof mediaItem === "string"
      ? mediaItem
      : mediaItem.url;

    setMediaToDelete(prev => [...prev, url]);

    setEditMedia(prev => prev.filter((_, i) => i !== index));

  };

  const handleRemoveNewFile = (index: number) => {

    setNewFiles(prev => {

      const updated = [...prev];
      updated[index] = null;
      return updated;

    });

  };

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const authorInitials = getInitials(post.author.displayName || "?");

  const isCurrentUser = (uid: string) => uid === user.uid;

  return (
    <>
      {/* CONTENEDOR POST */}
      <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 transition hover:border-white/15 ${deleting ? "opacity-50 pointer-events-none" : ""}`}>

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
              <p className="text-xs text-slate-500">
                {timeAgo(createdAt)}
              </p>
            </div>
          </div>

          {/* Author actions - COMPLETO con editar y borrar */}
          {isAuthor && !editing && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setShowImageModal(true);
                  setEditContent(post.content);
                  setEditMedia(post.media || []);
                  setNewFiles(Array(5).fill(null));
                  setMediaToDelete([]);
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

        {/* TEXTO */}
        <p className="text-sm text-slate-200 leading-relaxed mb-4 whitespace-pre-wrap">
          {post.content}
        </p>

        {/* MEDIA */}
        {post.media && Array.isArray(post.media) && post.media.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {post.media.map((mediaItem, index) => {
              let url;

              if (typeof mediaItem === "string") url = mediaItem;
              else url = mediaItem.url;

              if (!url) return null;

              const optimizedUrl = url.includes("/upload/")
                ? url.replace("/upload/", "/upload/f_auto,q_auto/")
                : url;

              const isVideo =
                mediaItem.type === "video" ||
                url.match(/\.(mp4|webm|ogg)$/i);

              return isVideo ? (
                <video
                  key={index}
                  src={optimizedUrl}
                  controls
                  className="w-full max-h-96 object-cover rounded-xl"
                />
              ) : (
                <img
                  key={index}
                  src={optimizedUrl}
                  loading="lazy"
                  className="w-full max-h-96 object-cover rounded-xl"
                />
              );
            })}
          </div>
        )}

        {/* LIKES - CORREGIDO con botón "Ver likes" y lista */}
        <div className="pt-3 border-t border-white/5">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              disabled={liking}
              className={`flex items-center gap-1.5 text-sm ${isLiked ? "text-rose-400" : "text-slate-500 hover:text-rose-400"}`}
            >
              {liking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-400" : ""}`} />
              )}
              <span className="text-xs font-medium">{likeCount}</span>
            </button>

            {likeCount > 0 && (
              <button
                onClick={() => setShowLikes(!showLikes)}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition"
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

          {/* LISTA DE USUARIOS QUE DIERON LIKE */}
          {showLikes && likes.length > 0 && (
            <div className="mt-3 space-y-2 pl-1">
              {likes.map((like) => {
                const likedDate = like.likedAt?.toDate?.() ?? new Date();
                const likeInitials = getInitials(like.displayName || "?");

                return (
                  <div key={like.uid} className="flex items-center gap-2.5">
                    {like.photoURL ? (
                      <img
                        src={like.photoURL}
                        alt={like.displayName}
                        className="w-6 h-6 rounded-full object-cover ring-1 ring-white/10"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-blue-600/60 flex items-center justify-center text-[10px] font-bold text-white ring-1 ring-white/10">
                        {likeInitials}
                      </div>
                    )}
                    <span className="text-xs text-slate-300">
                      {isCurrentUser(like.uid) ? (
                        <span className="text-blue-400 font-medium">Tú</span>
                      ) : (
                        like.displayName
                      )}
                    </span>
                    <span className="text-[10px] text-slate-600">·</span>
                    <span className="text-[10px] text-slate-500">{timeAgo(likedDate)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-2xl border border-white/10">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Editar publicación</h2>
              <button onClick={() => setShowImageModal(false)}>
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white resize-none mb-4"
              />

              <div className="grid grid-cols-5 gap-2 mb-4">
                {Array.from({ length: 5 }).map((_, index) => {
                  const existingMedia: any = editMedia[index];
                  const newFile = newFiles[index];

                  if (existingMedia) {
                    let url = typeof existingMedia === "string" ? existingMedia : existingMedia.url;
                    const isVideo = (existingMedia.type === "video") || url.match(/\.(mp4|webm|ogg)$/i);

                    return (
                      <div key={index} className="relative aspect-square">
                        {isVideo ? (
                          <video src={url} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <img src={url} className="w-full h-full object-cover rounded-lg" />
                        )}
                        <button
                          onClick={() => handleRemoveExistingMedia(index)}
                          className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    );
                  }

                  if (newFile) {
                    const preview = URL.createObjectURL(newFile);

                    return (
                      <div key={index} className="relative aspect-square">
                        {newFile.type.startsWith("video") ? (
                          <video src={preview} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <img src={preview} className="w-full h-full object-cover rounded-lg" />
                        )}
                        <button
                          onClick={() => handleRemoveNewFile(index)}
                          className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    );
                  }

                  return (
                    <label key={index} className="aspect-square border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center cursor-pointer">
                      <ImagePlus className="w-6 h-6 text-slate-500 mb-1" />
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => handleFileSelect(index, e)}
                        className="hidden"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-white/10">
              <button
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 text-sm text-slate-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveImages}
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Guardar cambios"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
