export type UserRole = "admin" | "manager" | "viewer";

export interface AdminUser {
  username: string;
  email?: string;
  name?: string;
  tenantId?: string;
  role?: UserRole;
  status: string;
  enabled: boolean;
  createdAt?: string;
  lastModified?: string;
}

export interface TenantOption {
  id: string;
  label: string;
}

export interface CreateUserPayload {
  email: string;
  name?: string;
  tenantId?: string;
  role?: UserRole;
  temporaryPassword?: string;
}

export interface UpdateUserPayload {
  name?: string;
  tenantId?: string;
  role?: UserRole;
}

