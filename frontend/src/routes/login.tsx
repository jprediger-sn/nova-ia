import { createFileRoute, Navigate } from '@tanstack/react-router';
import { LoginPage } from '@/pages/login';
import { useAuth } from '@/features/auth';

function LoginRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <LoginPage />;
}

export const Route = createFileRoute('/login')({
  component: LoginRoute,
});

