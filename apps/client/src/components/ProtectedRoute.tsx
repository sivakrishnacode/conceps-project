import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store';

export const ProtectedRoute = ({ children, requireVerified = false }: { children: ReactNode, requireVerified?: boolean }) => {
  const { accessToken, user } = useAuthStore();
  const location = useLocation();

  if (!accessToken || !user) {
    return <Navigate to="/register" state={{ from: location }} replace />;
  }

  // If requires verified (full user access) but user is not verified yet
  if (requireVerified && !user.isVerified) {
    return <Navigate to="/save-name" replace />;
  }

  return <>{children}</>;
};
