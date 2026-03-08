import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/useAuth";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import MainLayout from "./components/layout/MainLayout";
import Feed from "./components/feed/Feed";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;

    return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (user) return <Navigate to="/" replace />;

    return <>{children}</>;
}

export default function App() {
    return (
        <Routes>
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />
            <Route
                path="/register"
                element={
                    <PublicRoute>
                        <Register />
                    </PublicRoute>
                }
            />
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <Feed />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}