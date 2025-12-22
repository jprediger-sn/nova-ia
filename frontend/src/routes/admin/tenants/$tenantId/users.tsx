import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/protected-route";
import { AdminUsersPage } from "@/features/admin-users/admin-users-page";

export const Route = createFileRoute("/admin/tenants/$tenantId/users")({
  component: AdminUsersRoute,
});

function AdminUsersRoute() {
  const { tenantId } = Route.useParams();

  return (
    <ProtectedRoute>
      <AdminUsersPage tenantIdParam={tenantId} />
    </ProtectedRoute>
  );
}
