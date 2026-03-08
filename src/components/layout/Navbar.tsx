import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useAuth } from "../../context/useAuth";
import { BookOpen, LogOut } from "lucide-react";

function UserAvatar({ name, photoURL }: { name: string; photoURL: string | null }) {
    if (photoURL) {
        return <img src={photoURL} alt={name} className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10" />;
    }

    const initials = name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white ring-2 ring-white/10">
            {initials || "?"}
        </div>
    );
}

export default function Navbar() {
    const { user } = useAuth();
    if (!user) return null;

    const displayName = user.displayName || user.email || "Usuario";

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-white/5">
            <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
                        <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-bold text-white tracking-tight">Sintext</span>
                </div>

                {/* User info */}
                <div className="flex items-center gap-3">
                    <UserAvatar name={displayName} photoURL={user.photoURL} />
                    <span className="text-sm text-slate-300 hidden sm:block max-w-35 truncate">
                        {displayName}
                    </span>
                    <button
                        onClick={() => signOut(auth)}
                        className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                        title="Cerrar sesión"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </nav>
    );
}



