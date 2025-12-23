import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ModelSidebar } from "@/features/layout";
import { SiteHeader } from "@/features/layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useModels } from "../api/ModelsApi";
import { useParams } from "@tanstack/react-router";
import { useModelChunks } from "../api/ModelChunksApi";

export default function ModelChunks() {
  const [isLoadingChunks, setIsLoadingChunks] = useState(false);
  const { data: modelsData } = useModels();
  const { modelId } = useParams({ strict: false }) as { modelId: string };
  const { data: chunksData, isLoading, refetch } = useModelChunks(modelId);

  // Função para buscar ou processar chunks
  const handleLoadChunks = () => {
    setIsLoadingChunks(true);
    refetch().finally(() => {
      setIsLoadingChunks(false);
    });
  };

  const models = modelsData?.data?.data ?? [];

  return (
    <SidebarProvider>
      <ModelSidebar models={models} activeModelId={modelId} />
      <SidebarInset>
        <SiteHeader title="Chunks" />
        <div className="container mx-auto py-10">
          <Card>
            <CardHeader>
              <CardTitle>Chunks do Model</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center">
                <Button onClick={handleLoadChunks} disabled={isLoadingChunks || isLoading}>
                  {isLoadingChunks || isLoading ? "Carregando..." : "Carregar Chunks"}
                </Button>
                {/* Renderiza a lista de chunks se houver dados */}
                {chunksData?.data && chunksData.data.length > 0 ? (
                  <div className="mt-6 w-full space-y-2">
                    {chunksData.data.map((chunk) => (
                      <div
                        key={chunk.id}
                        className="p-4 border rounded-lg bg-card text-card-foreground"
                      >
                        <div className="text-sm font-medium mb-2">Chunk {chunk.id}</div>
                        <div className="text-sm text-muted-foreground">{chunk.content}</div>
                        {chunk.metadata && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            Metadata: {JSON.stringify(chunk.metadata)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 text-center text-muted-foreground">
                    Nenhum chunk carregado.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

