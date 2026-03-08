import { useState, useRef } from "react";
import { useAuth } from "../../context/useAuth";
import { createPost } from "../../services/post.service";
import { Send, Loader2, ImagePlus, X } from "lucide-react";

const MAX_FILES = 5;
const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB

export default function CreatePostForm() {

    const { user } = useAuth();

    const [content, setContent] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);

    const inputRef = useRef<HTMLInputElement | null>(null);

    if (!user) return null;

    /* =============================
       FILE SELECT
    ============================= */

    const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {

        const selected = Array.from(e.target.files || []);

        if (!selected.length) return;

        const newFiles: File[] = [];

        for (const file of selected) {

            if (files.length + newFiles.length >= MAX_FILES) {
                alert("Máximo 5 archivos por publicación");
                break;
            }

            if (file.type.startsWith("video") && file.size > MAX_VIDEO_SIZE) {
                alert(`El video "${file.name}" supera los 20MB`);
                continue;
            }

            newFiles.push(file);
        }

        setFiles(prev => [...prev, ...newFiles]);

        // limpiar input para permitir subir el mismo archivo otra vez
        if (inputRef.current) inputRef.current.value = "";
    };


    /* =============================
       REMOVE FILE
    ============================= */

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };


    /* =============================
       SUBMIT POST
    ============================= */

    const handleSubmit = async () => {

        const trimmed = content.trim();

        if (!trimmed && files.length === 0) return;

        setLoading(true);

        try {

            await createPost(
                trimmed,
                files,
                {
                    uid: user.uid,
                    displayName: user.displayName || "Anónimo",
                    photoURL: user.photoURL
                }
            );

            setContent("");
            setFiles([]);

        } catch (e) {

            console.error("Error al crear post:", e);

        } finally {

            setLoading(false);

        }
    };


    /* =============================
       USER INFO
    ============================= */

    const displayName = user.displayName || user.email || "Usuario";

    const initials = displayName
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();


    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 mb-6">

            <div className="flex gap-3">

                {/* AVATAR */}
                {user.photoURL ? (
                    <img
                        src={user.photoURL}
                        alt={displayName}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10 shrink-0"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white ring-2 ring-white/10 shrink-0">
                        {initials}
                    </div>
                )}


                <div className="flex-1">

                    {/* TEXTAREA */}
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="¿Qué estás pensando?"
                        rows={3}
                        disabled={loading}
                        className="w-full bg-transparent text-white placeholder-slate-500 text-sm resize-none
                        focus:outline-none border-none disabled:opacity-40"
                    />


                    {/* MEDIA PREVIEW */}
                    {files.length > 0 && (

                        <div className="grid grid-cols-3 gap-2 mt-3">

                            {files.map((file, index) => {

                                const preview = URL.createObjectURL(file);
                                const isImage = file.type.startsWith("image");

                                return (
                                    <div key={index} className="relative">

                                        {isImage ? (
                                            <img
                                                src={preview}
                                                className="rounded-lg object-cover w-full h-24"
                                            />
                                        ) : (
                                            <video
                                                src={preview}
                                                className="rounded-lg w-full h-24 object-cover"
                                            />
                                        )}

                                        <button
                                            onClick={() => removeFile(index)}
                                            className="absolute top-1 right-1 bg-black/60 p-1 rounded-full"
                                        >
                                            <X className="w-3 h-3 text-white"/>
                                        </button>

                                    </div>
                                );

                            })}

                        </div>

                    )}


                    {/* ACTION BAR */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-3">

                        {/* FILE INPUT */}
                        <label className="cursor-pointer flex items-center gap-2 text-sm text-slate-400 hover:text-white">

                            <ImagePlus className="w-4 h-4"/>

                            Foto 

                            <input
                                ref={inputRef}
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                onChange={handleFiles}
                                className="hidden"
                            />

                        </label>


                        {/* POST BUTTON */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading || (!content.trim() && files.length === 0)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40
                            text-white text-sm font-medium px-4 py-2 rounded-xl transition-all
                            active:scale-[0.98] cursor-pointer"
                        >

                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin"/>
                            ) : (
                                <>
                                    <Send className="w-4 h-4"/>
                                    Publicar
                                </>
                            )}

                        </button>

                    </div>

                </div>
            </div>
        </div>
    );
}