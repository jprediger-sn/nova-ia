import { useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "@/types/api/ApiResponse";

// Tipo mockado para Document
export type ModelDocument = {
  id: string;
  model_id: string;
  name: string;
  type: string;
  size: number;
  object_key?: string;
  created_at?: string;
};

// Função mockada para buscar documentos de um model
async function fetchModelDocuments(modelId: string): Promise<ApiResponse<ModelDocument[]>> {
  // Simula delay de rede
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Dados mockados
  const mockDocuments: ModelDocument[] = [
    {
      id: "doc-1",
      model_id: modelId,
      name: "documento-exemplo-1.pdf",
      type: "application/pdf",
      size: 1024000,
      object_key: "models/model-1/documents/doc-1.pdf",
      created_at: new Date().toISOString(),
    },
    {
      id: "doc-2",
      model_id: modelId,
      name: "documento-exemplo-2.docx",
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      size: 512000,
      object_key: "models/model-1/documents/doc-2.docx",
      created_at: new Date().toISOString(),
    },
    {
      id: "doc-3",
      model_id: modelId,
      name: "documento-exemplo-3.txt",
      type: "text/plain",
      size: 256000,
      object_key: "models/model-1/documents/doc-3.txt",
      created_at: new Date().toISOString(),
    },
  ];

  return {
    message: "Documentos encontrados com sucesso.",
    data: mockDocuments,
  };
}

// Hook para buscar documentos de um model
export function useModelDocuments(modelId: string) {
  return useQuery<ApiResponse<ModelDocument[]>>({
    queryKey: ["model-documents", modelId],
    queryFn: () => fetchModelDocuments(modelId),
    enabled: !!modelId,
  });
}

