import { createFileRoute, Navigate } from '@tanstack/react-router';
import { ProtectedRoute } from '@/components/protected-route';
import { HomePage } from '@/pages/home';
import { useAuth } from '@/features/auth';

function HomeRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  );
}

export const Route = createFileRoute('/')({
  component: HomeRoute,
});

