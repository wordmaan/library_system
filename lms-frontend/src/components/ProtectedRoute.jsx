//ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../services/AuthContext";


const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <p>Checking session...</p>;

  return user ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
