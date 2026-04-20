import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../services/AuthContext";

function ProtectedRoute({ allowedRoles }) {
    const { user, loading } = useAuth();

    if (loading) return <h3>Checking session...</h3>;

    if (!user) return <Navigate to="/" replace />;

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect based on role
        return (
            <Navigate
                to={user.role === "admin" ? "/admin/books" : "/user/books"}
                replace
            />
        );
    }

    return <Outlet />;
}

export default ProtectedRoute;
