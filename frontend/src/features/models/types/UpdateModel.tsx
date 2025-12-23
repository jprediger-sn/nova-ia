export type UpdateModel = {
  id: string;
  name?: string;
  tenant_id?: string | null;
}

export type UpdateModelResponse = {
  id: string;
  name: string;
  tenant_id?: string | null;
  created_at?: string | null;
}

