import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { isAuthenticated as checkToken } from "@/services/auth.service";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute Component
 * 
 * This component protects routes that require authentication.
 * It checks for:
 * 1. JWT token in localStorage
 * 2. User authentication state from AuthContext
 * 
 * If user is not authenticated, redirects to sign-in page.
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check both AuthContext state and JWT token in localStorage
  // This ensures the route is protected even if context hasn't loaded yet
  const hasToken = checkToken();
  const isUserAuthenticated = isAuthenticated || hasToken;

  // If user is not authenticated, redirect to sign-in page
  if (!isUserAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};
