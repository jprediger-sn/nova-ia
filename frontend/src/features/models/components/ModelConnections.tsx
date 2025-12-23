import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModelSidebar } from "@/features/layout";
import { SiteHeader } from "@/features/layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useModels } from "../api/ModelsApi";
import { useParams } from "@tanstack/react-router";
import { useModelConnections } from "../api/ModelConnectionsApi";

export default function ModelConnections() {
  const { data: modelsData } = useModels();
  const { modelId } = useParams({ strict: false }) as { modelId: string };
  const { data: connectionsData, isLoading } = useModelConnections(modelId);

  const models = modelsData?.data?.data ?? [];

  return (
    <SidebarProvider>
      <ModelSidebar models={models} activeModelId={modelId} />
      <SidebarInset>
        <SiteHeader title="Conexões" />
        <div className="container mx-auto py-10">
          <Card>
            <CardHeader>
              <CardTitle>Conexões do Model</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center text-muted-foreground py-8">
                  Carregando conexões...
                </div>
              ) : connectionsData?.data && connectionsData.data.length > 0 ? (
                <div className="space-y-4">
                  {connectionsData.data.map((connection) => (
                    <div
                      key={connection.id}
                      className="p-4 border rounded-lg bg-card text-card-foreground"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">{connection.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Tipo: {connection.type} • Status: {connection.status}
                          </div>
                          {connection.config && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              Config: {JSON.stringify(connection.config)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Nenhuma conexão encontrada.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

