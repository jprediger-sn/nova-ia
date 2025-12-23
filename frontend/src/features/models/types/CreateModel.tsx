export type CreateModel = {
  name: string;
  tenant_id?: string | null;
}

export type CreateModelResponse = {
  id: string;
  name: string;
  tenant_id?: string | null;
  created_at?: string | null;
}

