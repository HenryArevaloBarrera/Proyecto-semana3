import {type ReactNode, useEffect, useState} from "react";
import {onAuthStateChanged, type User} from "firebase/auth";
import {auth} from "../firebase.ts";
import {AuthContext} from "./AuthContext.tsx";

export function AuthProvider({children}: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    return (
        <AuthContext.Provider value={{user, loading}}>
            {children}
        </AuthContext.Provider>
    );
}
