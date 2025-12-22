import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminUser } from "../types";

interface UserTableProps {
  users: AdminUser[];
  isLoading?: boolean;
  onEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
  onEnable: (user: AdminUser) => void;
  onDisable: (user: AdminUser) => void;
  onResetPassword: (user: AdminUser) => void;
}

export function UserTable({
  users,
  isLoading,
  onEdit,
  onDelete,
  onEnable,
  onDisable,
  onResetPassword,
}: UserTableProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) =>
      [user.username, user.email, user.name, user.role, user.tenantId]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(term))
    );
  }, [users, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Buscar por nome, email ou username"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <p className="text-sm text-muted-foreground">
          {filtered.length} usuário{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Usuário</th>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-4 py-6 text-center text-muted-foreground" colSpan={5}>
                  Carregando usuários...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-muted-foreground" colSpan={5}>
                  Nenhum usuário encontrado.
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.username} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{user.email || user.username}</span>
                      <span className="text-xs text-muted-foreground">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name || "—"}</span>
                      {user.tenantId && (
                        <span className="text-xs text-muted-foreground">Tenant: {user.tenantId}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {user.role || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          user.enabled ? "bg-emerald-500" : "bg-destructive"
                        }`}
                      />
                      <span className="text-sm text-muted-foreground">
                        {user.enabled ? "Ativo" : "Desabilitado"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{user.status}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" onClick={() => onEdit(user)}>
                        Editar
                      </Button>
                      {user.enabled ? (
                        <Button size="sm" variant="outline" onClick={() => onDisable(user)}>
                          Desabilitar
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => onEnable(user)}>
                          Habilitar
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => onResetPassword(user)}>
                        Resetar senha
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(user)}
                      >
                        Remover
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

