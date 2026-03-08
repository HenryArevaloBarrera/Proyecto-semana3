import type { ReactNode } from "react";
import Navbar from "./Navbar";

export default function MainLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-950 to-slate-900 relative overflow-hidden">
            {/* Glows decorativos */}
            <div className="fixed -top-60 -left-60 w-120 h-120 bg-blue-600 rounded-full opacity-5 blur-3xl pointer-events-none" />
            <div className="fixed -bottom-60 -right-60 w-120 h-120 bg-indigo-600 rounded-full opacity-5 blur-3xl pointer-events-none" />

            <Navbar />

            <main className="max-w-2xl mx-auto px-4 py-6 relative">
                {children}
            </main>
        </div>
    );
}


