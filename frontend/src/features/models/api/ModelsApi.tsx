import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Model } from "../types/Model";
import {
  type CreateModel,
  type CreateModelResponse,
} from "../types/CreateModel";
import type { ApiResponse } from "@/types/api/ApiResponse";
import type { UpdateModelResponse, UpdateModel } from "../types/UpdateModel";
import { cognitoClient } from "@/lib/cognito/client";

const backend_url = import.meta.env.VITE_API_BASE_URL;

// Função para buscar todos os models
export function useModels() {
  return useQuery<ApiResponse<{ data: Model[]; total: number }>>({
    queryKey: ["models"],
    queryFn: async () => {
      const token = await cognitoClient.getIdToken();
      const res = await fetch(`${backend_url}/api/models`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Erro ao buscar models");
      return res.json() as Promise<ApiResponse<{ data: Model[]; total: number }>>;
    },
  });
}

// Criar um novo model
export function useCreateModel() {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<CreateModelResponse>, Error, CreateModel>({
    mutationFn: async (novoModel) => {
      const token = await cognitoClient.getIdToken();
      const res = await fetch(`${backend_url}/api/models`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(novoModel),
      });
      if (!res.ok) throw new Error("Erro ao criar model");
      return res.json() as Promise<ApiResponse<CreateModelResponse>>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
    },
  });
}

// Atualizar um model existente
export function useUpdateModel() {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<UpdateModelResponse>, Error, UpdateModel>({
    mutationFn: async (modelAtualizado) => {
      const { id, ...body } = modelAtualizado;
      const token = await cognitoClient.getIdToken();

      const res = await fetch(`${backend_url}/api/models/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Erro ao atualizar model");
      return res.json() as Promise<ApiResponse<UpdateModelResponse>>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
    },
  });
}

// Deletar um model existente
export function useDeleteModel() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const token = await cognitoClient.getIdToken();
      const res = await fetch(`${backend_url}/api/models/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Erro ao deletar model");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
    },
  });
}

