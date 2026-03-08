import { Loader2 } from "lucide-react";
import * as React from "react";

// ── Google Icon ──────────────────────────────────────────────────────────────

export function GoogleIcon() {
    return (
        <svg className="w-4 h-4" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.08-6.08C34.46 3.08 29.5 1 24 1 14.82 1 7.07 6.48 3.64 14.24l7.08 5.5C12.38 13.36 17.73 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.15 24.5c0-1.6-.14-3.14-.4-4.63H24v9.26h12.44c-.54 2.9-2.18 5.36-4.64 7.02l7.1 5.52C43.3 37.74 46.15 31.57 46.15 24.5z"/>
            <path fill="#FBBC05" d="M10.72 28.26A14.6 14.6 0 0 1 9.5 24c0-1.48.26-2.92.72-4.26l-7.08-5.5A23.93 23.93 0 0 0 0 24c0 3.87.93 7.54 2.57 10.77l8.15-6.51z"/>
            <path fill="#34A853" d="M24 47c5.5 0 10.12-1.82 13.49-4.95l-7.1-5.52c-1.97 1.32-4.5 2.1-6.39 2.1-6.27 0-11.62-3.86-13.28-9.37l-8.15 6.51C7.07 41.52 14.82 47 24 47z"/>
        </svg>
    );
}

// ── InputField ───────────────────────────────────────────────────────────────

interface InputFieldProps {
    type: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    icon: React.ReactNode;
}

export function InputField({ type, placeholder, value, onChange, icon }: InputFieldProps) {
    return (
        <div className="relative mb-3">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                {icon}
            </span>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm
                           bg-white/5 text-white placeholder-slate-500
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition"
            />
        </div>
    );
}

// ── AuthButton ───────────────────────────────────────────────────────────────

interface AuthButtonProps {
    onClick: () => void;
    loading?: boolean;
    variant: "primary" | "secondary" | "outline";
    icon?: React.ReactNode;
    children: React.ReactNode;
}

export function AuthButton({ onClick, loading = false, variant, icon, children }: AuthButtonProps) {
    const base = "w-full py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer";
    const styles: Record<AuthButtonProps["variant"], string> = {
        primary:   "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98]",
        secondary: "bg-white/10 text-slate-200 hover:bg-white/15 active:scale-[0.98]",
        outline:   "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 shadow-sm active:scale-[0.98]",
    };

    return (
        <button onClick={onClick} disabled={loading} className={`${base} ${styles[variant]}`}>
            {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <>{icon && <span className="flex items-center">{icon}</span>}{children}</>
            }
        </button>
    );
}

// ── AuthLayout ───────────────────────────────────────────────────────────────

export function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 px-4 relative overflow-hidden">
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600 rounded-full opacity-10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600 rounded-full opacity-10 blur-3xl pointer-events-none" />
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-sm">
                {children}
            </div>
        </div>
    );
}

