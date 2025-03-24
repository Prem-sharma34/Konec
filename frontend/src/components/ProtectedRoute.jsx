import { Navigate, Outlet } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decoded = jwtDecode(token);
    const isExpired = decoded.exp * 1000 < Date.now();

    if (isExpired) {
      localStorage.removeItem("token");
      localStorage.removeItem("user"); 
      return <Navigate to="/login" />;
    }
  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); 
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
