import { Navigate, Outlet } from "react-router-dom";
import { useApp } from "../store/AppContext.jsx";

export default function ProtectedRoute({ role }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/auth" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <Outlet />;
}
