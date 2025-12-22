import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/features/auth";
import {
  createUser,
  deleteUser,
  disableUser,
  enableUser,
  fetchTenants,
  fetchUsersByTenant,
  resetUserPassword,
  updateUser,
} from "@/lib/api/admin-users";
import type { AdminUser, CreateUserPayload, TenantOption, UpdateUserPayload } from "./types";
import { TenantSelector } from "./components/tenant-selector";
import { UserForm } from "./components/user-form";
import { UserTable } from "./components/user-table";

interface AdminUsersPageProps {
  tenantIdParam: string;
}

export function AdminUsersPage({ tenantIdParam }: AdminUsersPageProps) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>(tenantIdParam);
  const [isLoadingTenants, setIsLoadingTenants] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const canManage = useMemo(() => {
    if (!user) return false;
    return user.role === "admin" || user.role === "manager";
  }, [user]);

  useEffect(() => {
    if (tenantIdParam) {
      setSelectedTenant(tenantIdParam);
    }
  }, [tenantIdParam]);

  useEffect(() => {
    const loadTenants = async () => {
      try {
        setIsLoadingTenants(true);
        const data = await fetchTenants();
        const normalized = data.length
          ? data
          : user?.tenantId
            ? [{ id: user.tenantId, label: user.tenantId }]
            : [];
        setTenants(normalized);

        // Define tenant padrão se ainda não houver
        if (!tenantIdParam && normalized.length > 0) {
          const initialTenant = user?.role === "admin" ? normalized[0].id : user?.tenantId ?? normalized[0].id;
          setSelectedTenant(initialTenant);
          navigate({
            to: "/admin/tenants/$tenantId/users",
            params: { tenantId: initialTenant },
            replace: true,
          });
        }
      } catch (error) {
        console.error("Erro ao buscar tenants", error);
        toast.error("Não foi possível carregar os tenants.");
      } finally {
        setIsLoadingTenants(false);
      }
    };

    loadTenants();
  }, [navigate, tenantIdParam, user]);

  useEffect(() => {
    if (!selectedTenant) return;

    const loadUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const data = await fetchUsersByTenant(selectedTenant);
        setUsers(data);
      } catch (error) {
        console.error("Erro ao buscar usuários", error);
        toast.error("Não foi possível carregar os usuários.");
      } finally {
        setIsLoadingUsers(false);
      }
    };

    loadUsers();
  }, [selectedTenant]);

  const handleTenantChange = (tenantId: string) => {
    setSelectedTenant(tenantId);
    navigate({
      to: "/admin/tenants/$tenantId/users",
      params: { tenantId },
    });
  };

  const handleCreate = async (payload: CreateUserPayload) => {
    try {
      const userCreated = await createUser(payload);
      setUsers((prev) => [userCreated, ...prev]);
      toast.success("Usuário criado com sucesso.");
    } catch (error: any) {
      toast.error(error?.message || "Erro ao criar usuário.");
    }
  };

  const handleEdit = async (username: string, payload: UpdateUserPayload) => {
    try {
      const updated = await updateUser(username, payload);
      setUsers((prev) => prev.map((u) => (u.username === username ? updated : u)));
      setEditingUser(null);
      toast.success("Usuário atualizado.");
    } catch (error: any) {
      toast.error(error?.message || "Erro ao atualizar usuário.");
    }
  };

  const handleDelete = async (userToDelete: AdminUser) => {
    const confirmed = window.confirm(`Remover usuário ${userToDelete.email || userToDelete.username}?`);
    if (!confirmed) return;

    try {
      await deleteUser(userToDelete.username);
      setUsers((prev) => prev.filter((u) => u.username !== userToDelete.username));
      toast.success("Usuário removido.");
    } catch (error: any) {
      toast.error(error?.message || "Erro ao remover usuário.");
    }
  };

  const handleEnable = async (target: AdminUser) => {
    try {
      await enableUser(target.username);
      setUsers((prev) =>
        prev.map((u) => (u.username === target.username ? { ...u, enabled: true } : u)),
      );
      toast.success("Usuário habilitado.");
    } catch (error: any) {
      toast.error(error?.message || "Erro ao habilitar usuário.");
    }
  };

  const handleDisable = async (target: AdminUser) => {
    try {
      await disableUser(target.username);
      setUsers((prev) =>
        prev.map((u) => (u.username === target.username ? { ...u, enabled: false } : u)),
      );
      toast.success("Usuário desabilitado.");
    } catch (error: any) {
      toast.error(error?.message || "Erro ao desabilitar usuário.");
    }
  };

  const handleResetPassword = async (target: AdminUser) => {
    try {
      await resetUserPassword(target.username);
      toast.success("Reset de senha solicitado. Usuário receberá um email.");
    } catch (error: any) {
      toast.error(error?.message || "Erro ao resetar senha.");
    }
  };

  if (isLoading || !user) {
    return null;
  }

  if (!canManage) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-5xl">
          <Card>
            <CardHeader>
              <CardTitle>Acesso restrito</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Apenas usuários com papel admin ou manager podem acessar esta área.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-primary">Administração</p>
          <h1 className="text-3xl font-bold">Gestão de usuários</h1>
          <p className="text-muted-foreground">
            Gerencie usuários por tenant, altere roles, habilite/desabilite e resete senhas.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tenant</CardTitle>
              </CardHeader>
              <CardContent>
                <TenantSelector
                  tenants={tenants}
                  value={selectedTenant}
                  onChange={handleTenantChange}
                  disabled={isLoadingTenants || user.role !== "admin"}
                  label={isLoadingTenants ? "Carregando..." : "Selecionar tenant"}
                />
              </CardContent>
            </Card>

            <UserForm
              mode={editingUser ? "edit" : "create"}
              defaultTenantId={selectedTenant}
              initialData={editingUser}
              onSubmitCreate={handleCreate}
              onSubmitEdit={handleEdit}
              onCancelEdit={() => setEditingUser(null)}
            />
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Usuários do tenant</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedTenant || "Selecione um tenant para listar usuários"}
                </p>
              </div>
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Novo usuário
              </Button>
            </CardHeader>
            <CardContent>
              <UserTable
                users={users}
                isLoading={isLoadingUsers}
                onEdit={(u) => setEditingUser(u)}
                onDelete={handleDelete}
                onEnable={handleEnable}
                onDisable={handleDisable}
                onResetPassword={handleResetPassword}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

