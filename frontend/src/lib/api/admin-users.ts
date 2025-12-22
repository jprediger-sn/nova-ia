import { cognitoClient } from "@/lib/cognito/client";
import { AppError } from "@/lib/errors";
import type {
  AdminUser,
  CreateUserPayload,
  TenantOption,
  UpdateUserPayload,
} from "@/features/admin-users/types";

// URL da API vindo do SST (VITE_API_BASE_URL). Se estiver ausente, usa path relativo (dev local).
// Observação: as rotas aqui já incluem o prefixo "/api/...".
const API_BASE = ((import.meta.env.VITE_API_BASE_URL as string | undefined) || "").replace(/\/$/, "");

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = await cognitoClient.getIdToken();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const response = await fetch(`${API_BASE}${normalizedPath}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.details || data?.message || "Erro ao comunicar com o servidor";
    const code = data?.code || `HTTP_${response.status}`;
    throw new AppError({ message, code, status: response.status });
  }

  return (data?.data?.data ?? data?.data ?? data) as T;
}

export async function fetchTenants(): Promise<TenantOption[]> {
  const tenants = await request<string[]>("/api/tenants");
  return tenants.map((tenantId) => ({
    id: tenantId,
    label: tenantId,
  }));
}

export async function fetchUsersByTenant(tenantId: string): Promise<AdminUser[]> {
  const users = await request<any[]>(`/api/users?tenant_id=${encodeURIComponent(tenantId)}`);
  return users.map(normalizeUser);
}

export async function createUser(payload: CreateUserPayload): Promise<AdminUser> {
  const user = await request<any>("/api/users", {
    method: "POST",
    body: {
      email: payload.email,
      name: payload.name,
      tenant_id: payload.tenantId,
      role: payload.role,
      temporary_password: payload.temporaryPassword,
    },
  });
  return normalizeUser(user);
}

export async function updateUser(username: string, payload: UpdateUserPayload): Promise<AdminUser> {
  const user = await request<any>(`/api/users/${encodeURIComponent(username)}`, {
    method: "PUT",
    body: {
      name: payload.name,
      tenant_id: payload.tenantId,
      role: payload.role,
    },
  });
  return normalizeUser(user);
}

export async function deleteUser(username: string): Promise<void> {
  await request(`/api/users/${encodeURIComponent(username)}`, { method: "DELETE" });
}

export async function enableUser(username: string): Promise<void> {
  await request(`/api/users/${encodeURIComponent(username)}/enable`, { method: "POST" });
}

export async function disableUser(username: string): Promise<void> {
  await request(`/api/users/${encodeURIComponent(username)}/disable`, { method: "POST" });
}

export async function resetUserPassword(username: string): Promise<void> {
  await request(`/api/users/${encodeURIComponent(username)}/reset-password`, { method: "POST" });
}

function normalizeUser(raw: any): AdminUser {
  return {
    username: raw.username,
    email: raw.email ?? undefined,
    name: raw.name ?? undefined,
    tenantId: raw.tenant_id ?? raw.tenantId ?? undefined,
    role: raw.role ?? undefined,
    status: raw.status ?? "UNKNOWN",
    enabled: Boolean(raw.enabled),
    createdAt: raw.created_at ?? raw.createdAt,
    lastModified: raw.last_modified ?? raw.lastModified,
  };
}

