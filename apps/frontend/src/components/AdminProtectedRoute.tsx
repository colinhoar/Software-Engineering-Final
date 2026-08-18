import { Navigate } from "react-router-dom";
import { useAuth } from "./auth_context.tsx";
import React from "react";

// this is literally the same thing as Protected route but it checks if logged in AND admin
// so that i dont need to do jank stuff in protected route we can double wrap stuff or somethiing
// because as it stands all admins are employees and all emplyees are not admins

const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isLoggedIn, isAdmin } = useAuth();

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/" replace state={{ unauthorized: true }} />;
    }

    return <>{children}</>;
};

export default AdminProtectedRoute;
