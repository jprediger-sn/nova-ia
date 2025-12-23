// AppRouterProvider.tsx
import { RouterProvider} from "@tanstack/react-router";
import { useAuth} from "@/features/auth/hooks/use-auth";
import { router } from "@/router"; // ou onde você exporta seu router

export function AppRouterProvider() {
  const auth = useAuth();

  return (
    <RouterProvider
      router={router}
      context={{
        auth,
      }}
    />
  );
}