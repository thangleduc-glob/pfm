/**
 * Protected Route Component
 * Protects routes that require authentication
 */


interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // TODO: Implement actual authentication check
  // For now, just render children
  return <>{children}</>;
};

export default ProtectedRoute;