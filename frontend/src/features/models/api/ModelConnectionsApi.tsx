import { useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "@/types/api/ApiResponse";

// Tipo mockado para Connection
export type ModelConnection = {
  id: string;
  model_id: string;
  name: string;
  type: string;
  status: "active" | "inactive" | "pending";
  config?: Record<string, unknown>;
  created_at?: string;
};

// Função mockada para buscar conexões de um model
async function fetchModelConnections(modelId: string): Promise<ApiResponse<ModelConnection[]>> {
  // Simula delay de rede
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Dados mockados
  const mockConnections: ModelConnection[] = [
    {
      id: "conn-1",
      model_id: modelId,
      name: "Conexão API Externa",
      type: "api",
      status: "active",
      config: { endpoint: "https://api.example.com", timeout: 5000 },
      created_at: new Date().toISOString(),
    },
    {
      id: "conn-2",
      model_id: modelId,
      name: "Conexão Database",
      type: "database",
      status: "active",
      config: { host: "localhost", port: 5432, database: "models_db" },
      created_at: new Date().toISOString(),
    },
    {
      id: "conn-3",
      model_id: modelId,
      name: "Conexão Webhook",
      type: "webhook",
      status: "pending",
      config: { url: "https://webhook.example.com/callback" },
      created_at: new Date().toISOString(),
    },
  ];

  return {
    message: "Conexões encontradas com sucesso.",
    data: mockConnections,
  };
}

// Hook para buscar conexões de um model
export function useModelConnections(modelId: string) {
  return useQuery<ApiResponse<ModelConnection[]>>({
    queryKey: ["model-connections", modelId],
    queryFn: () => fetchModelConnections(modelId),
    enabled: !!modelId,
  });
}

