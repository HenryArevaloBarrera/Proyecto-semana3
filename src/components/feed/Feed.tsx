import { useEffect, useState } from "react";
import { useAuth } from "../../context/useAuth";
import { subscribePosts, deletePost } from "../../services/post.service";
import type { Post } from "../../types/post";
import CreatePostForm from "./CreatePostForm";
import PostCard from "./PostCard";
import { Loader2, MessageCircle, Search, X, User } from "lucide-react";

export default function Feed() {
    const { user } = useAuth();
    const [posts, setPosts]               = useState<Post[]>([]);
    const [loading, setLoading]           = useState(true);
    const [deletingIds, setDeletingIds]   = useState<Set<string>>(new Set());
    const [showOnlyMine, setShowOnlyMine] = useState(false);
    const [searchQuery, setSearchQuery]   = useState("");

    useEffect(() => {
        const unsub = subscribePosts((data) => {
            setPosts(data);
            setLoading(false);

            // Limpiar IDs de posts que ya fueron eliminados por el servidor
            setDeletingIds((prev) => {
                if (prev.size === 0) return prev;
                const next = new Set<string>();
                prev.forEach((id) => { if (data.some((p) => p.id === id)) next.add(id); });
                return next.size !== prev.size ? next : prev;
            });
        });
        return () => unsub();
    }, []);

    const handleDelete = async (id: string) => {
        setDeletingIds((prev) => new Set(prev).add(id));
        try {
            await deletePost(id);
        } catch (e) {
            console.error("Error al eliminar post:", e);
            setDeletingIds((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };


    const filteredPosts = posts.filter((post) => {
        if (showOnlyMine && post.author.uid !== user?.uid) return false;
        if (searchQuery.trim()) {
            if (post.author.uid === user?.uid) return false;
            const name = post.author.displayName?.toLowerCase() ?? "";
            if (!name.includes(searchQuery.trim().toLowerCase())) return false;
        }
        return true;
    });

    return (
        <>
            <CreatePostForm />

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            if (e.target.value.trim()) setShowOnlyMine(false);
                        }}
                        placeholder="Buscar por nombre de usuario..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-9 py-2.5 text-sm
                                   text-white placeholder-slate-500 focus:outline-none focus:ring-2
                                   focus:ring-blue-500 focus:border-transparent transition"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <button
                    onClick={() => {
                        setShowOnlyMine(!showOnlyMine);
                        if (!showOnlyMine) setSearchQuery("");
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer
                        whitespace-nowrap border
                        ${showOnlyMine
                            ? "bg-blue-600 border-blue-500 text-white"
                            : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                        }`}
                >
                    <User className="w-4 h-4" />
                    Mis posts
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                </div>
            ) : filteredPosts.length === 0 ? (
                <div className="text-center py-20">
                    <MessageCircle className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">
                        {searchQuery.trim()
                            ? `No se encontraron posts de "${searchQuery.trim()}"`
                            : showOnlyMine
                                ? "Aún no has publicado nada"
                                : "No hay publicaciones aún"}
                    </p>
                    {!searchQuery.trim() && !showOnlyMine && (
                        <p className="text-slate-600 text-xs mt-1">¡Sé el primero en publicar algo!</p>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {filteredPosts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            deleting={deletingIds.has(post.id)}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </>
    );
}
