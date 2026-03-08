import { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { BookOpen, LogIn, Mail, Lock } from "lucide-react";
import { AuthLayout, InputField, AuthButton, GoogleIcon } from "./AuthComponents";

const googleProvider = new GoogleAuthProvider();

type LoadingState = "idle" | "login" | "google";

export default function Login() {
    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const [error, setError]       = useState("");
    const [loadingState, setLoadingState] = useState<LoadingState>("idle");

    const withLoading = async (key: LoadingState, action: () => Promise<void>) => {
        setError("");
        setLoadingState(key);
        try {
            await action();
        } catch (e) {
            setError((e as Error).message ?? "Ocurrió un error inesperado.");
        } finally {
            setLoadingState("idle");
        }
    };

    const handleEmailLogin = () =>
        withLoading("login", () => signInWithEmailAndPassword(auth, email, password).then(() => {}));

    const handleGoogle = () =>
        withLoading("google", () => signInWithPopup(auth, googleProvider).then(() => {}));

    return (
        <AuthLayout>
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
                    <BookOpen className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Sintext</h1>
                <p className="text-sm text-slate-400 mt-1">Inicia sesión en tu cuenta</p>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl px-4 py-2.5 mb-4 text-center">
                    {error}
                </div>
            )}

            {/* Inputs */}
            <InputField type="email" placeholder="Correo electrónico" value={email} onChange={setEmail} icon={<Mail className="w-4 h-4" />} />
            <InputField type="password" placeholder="Contraseña" value={password} onChange={setPassword} icon={<Lock className="w-4 h-4" />} />

            {/* Login button */}
            <div className="mt-2 mb-5">
                <AuthButton variant="primary" onClick={handleEmailLogin} loading={loadingState === "login"} icon={<LogIn className="w-4 h-4" />}>
                    Iniciar sesión
                </AuthButton>
            </div>

            {/* Link to register */}
            <p className="text-center text-xs text-slate-500 mb-5">
                ¿No tienes cuenta?{" "}
                <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition">
                    Regístrate
                </Link>
            </p>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 border-t border-white/10" />
                <span className="text-xs text-slate-500 font-medium">o continúa con</span>
                <div className="flex-1 border-t border-white/10" />
            </div>

            {/* Google */}
            <AuthButton variant="outline" onClick={handleGoogle} loading={loadingState === "google"} icon={<GoogleIcon />}>
                Google
            </AuthButton>
        </AuthLayout>
    );
}

