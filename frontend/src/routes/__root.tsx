import { createRootRoute, Outlet } from '@tanstack/react-router';
import { AuthProvider } from '@/features/auth';
import { Toaster } from 'sonner';

export const Route = createRootRoute({
  component: () => (
    <AuthProvider>
      <Outlet />
      <Toaster position="top-center" />
    </AuthProvider>
  ),
});

