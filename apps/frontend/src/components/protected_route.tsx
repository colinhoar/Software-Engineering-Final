import { Navigate } from "react-router-dom";
import { useAuth } from "./auth_context.tsx";
import React from "react";

/* This is not as deep as I thought it was going to be therefore it is working well */
/* note to self when referencing isLoggedIn actually use localStorage.get/set instead of just referencing it like I just did :C */

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isLoggedIn } = useAuth();

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
