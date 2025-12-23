import { useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "@/types/api/ApiResponse";

// Tipo mockado para Chunk
export type ModelChunk = {
  id: string;
  model_id: string;
  content: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
};

// Função mockada para buscar chunks de um model
async function fetchModelChunks(modelId: string): Promise<ApiResponse<ModelChunk[]>> {
  // Simula delay de rede
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Dados mockados
  const mockChunks: ModelChunk[] = [
    {
      id: "chunk-1",
      model_id: modelId,
      content: "Este é um chunk de exemplo para o model. Contém informações relevantes sobre o modelo.",
      metadata: { source: "document-1", page: 1 },
      created_at: new Date().toISOString(),
    },
    {
      id: "chunk-2",
      model_id: modelId,
      content: "Outro chunk de exemplo com mais informações sobre o funcionamento do model.",
      metadata: { source: "document-1", page: 2 },
      created_at: new Date().toISOString(),
    },
    {
      id: "chunk-3",
      model_id: modelId,
      content: "Terceiro chunk demonstrando a estrutura de dados dos chunks do model.",
      metadata: { source: "document-2", page: 1 },
      created_at: new Date().toISOString(),
    },
  ];

  return {
    message: "Chunks encontrados com sucesso.",
    data: mockChunks,
  };
}

// Hook para buscar chunks de um model
export function useModelChunks(modelId: string) {
  return useQuery<ApiResponse<ModelChunk[]>>({
    queryKey: ["model-chunks", modelId],
    queryFn: () => fetchModelChunks(modelId),
    enabled: !!modelId,
  });
}

