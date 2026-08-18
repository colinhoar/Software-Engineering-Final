import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
    isLoggedIn: boolean;
    email: string | null;
    isAdmin: boolean;
    login: (token: string, email: string, isAdmin: boolean) => void;
    logout: () => void;
}

{/*This does what login form originally did and sets context to either logged in or out*/}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    //  Immediately check localStorage before first render
    const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem("isLoggedIn") === "true");
    const [email, setEmail] = useState<string | null>(() => localStorage.getItem("email"));
    const [isAdmin, setIsAdmin] = useState<boolean>(() => localStorage.getItem("isAdmin") === "true");

    const login = (token: string, email: string, isAdmin: boolean) => {
        localStorage.setItem("accessToken", token);
        localStorage.setItem("email", email);
        localStorage.setItem("isLoggedIn", "true"); // explicitly set
        localStorage.setItem("isAdmin", isAdmin ? "true" : "false");
        setIsLoggedIn(true);
        setEmail(email);
        setIsAdmin(isAdmin);
    };

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("email");
        localStorage.removeItem("isLoggedIn"); // clean up
        localStorage.removeItem("isAdmin");
        setIsLoggedIn(false);
        setEmail(null);
        setIsAdmin(false);
        localStorage.removeItem("name");
        localStorage.removeItem('profileColor')
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, email, isAdmin, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext)!;
