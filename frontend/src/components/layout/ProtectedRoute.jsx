import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { PageLoader } from '../ui/Spinner';

/**
 * ProtectedRoute - Wrapper for routes that require authentication and specific roles.
 */
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, isCheckingAuth, user } = useAuthStore();
  const location = useLocation();

  if (isCheckingAuth) {
    return <PageLoader />;
  }

  if (!isAuthenticated || !user) {
    // Redirect to login but save the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check roles if specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Role not authorized, redirect to dashboard or appropriate page
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
