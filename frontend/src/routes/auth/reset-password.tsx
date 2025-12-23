import { createFileRoute, Navigate } from '@tanstack/react-router';
import { ResetPasswordPage } from '@/pages/reset-password';
import { useAuth } from '@/features/auth';

function ResetPasswordRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  // Se já estiver autenticado, redireciona para home
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <ResetPasswordPage />;
}

export const Route = createFileRoute('/auth/reset-password')({
  component: ResetPasswordRoute,
});
