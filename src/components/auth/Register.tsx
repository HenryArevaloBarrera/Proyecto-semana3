import {useState} from "react";
import {Link} from "react-router-dom";
import {auth} from "../../firebase";
import {
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    updateProfile,
} from "firebase/auth";
import {BookOpen, UserPlus, Mail, Lock, User} from "lucide-react";
import {AuthLayout, InputField, AuthButton, GoogleIcon} from "./AuthComponents";

const googleProvider = new GoogleAuthProvider();

type LoadingState = "idle" | "register" | "google";

export default function Register() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
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

    const handleRegister = () =>
        withLoading("register", async () => {
            const {user} = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(user, {displayName: fullName.trim()});
        });

    const handleGoogle = () =>
        withLoading("google", () => signInWithPopup(auth, googleProvider).then(() => {
        }));

    return (
        <AuthLayout>
            {/* Header */}
            <div className="text-center mb-8">
                <div
                    className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
                    <BookOpen className="w-7 h-7 text-white"/>
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Sintext</h1>
                <p className="text-sm text-slate-400 mt-1">Crea tu cuenta</p>
            </div>

            {/* Error */}
            {error && (
                <div
                    className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl px-4 py-2.5 mb-4 text-center">
                    {error}
                </div>
            )}

            {/* Inputs */}
            <InputField type="text" placeholder="Nombre completo" value={fullName} onChange={setFullName}
                        icon={<User className="w-4 h-4"/>}/>
            <InputField type="email" placeholder="Correo electrónico" value={email} onChange={setEmail}
                        icon={<Mail className="w-4 h-4"/>}/>
            <InputField type="password" placeholder="Contraseña" value={password} onChange={setPassword}
                        icon={<Lock className="w-4 h-4"/>}/>

            {/* Register button */}
            <div className="mt-2 mb-5">
                <AuthButton variant="primary" onClick={handleRegister} loading={loadingState === "register"}
                            icon={<UserPlus className="w-4 h-4"/>}>
                    Crear cuenta
                </AuthButton>
            </div>

            {/* Link to login */}
            <p className="text-center text-xs text-slate-500 mb-5">
                ¿Ya tienes cuenta?{" "}
                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition">
                    Inicia sesión
                </Link>
            </p>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 border-t border-white/10"/>
                <span className="text-xs text-slate-500 font-medium">o continúa con</span>
                <div className="flex-1 border-t border-white/10"/>
            </div>

            {/* Google */}
            <AuthButton variant="outline" onClick={handleGoogle} loading={loadingState === "google"}
                        icon={<GoogleIcon/>}>
                Google
            </AuthButton>
        </AuthLayout>
    );
}

