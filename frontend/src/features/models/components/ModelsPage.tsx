import { useModels } from "../api/ModelsApi";
import { modelColumns } from "../table/ModelsTableColumns";
import { GenericTable } from "@/components/table/GenericTable";
import type { Model } from "../types/Model";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, PlusCircle, RefreshCw, Trash2 } from "lucide-react";
import { MutateModelDialog } from "./MutateModelDialog";
import { useState } from "react";
import { DeleteModelAlert } from "./DeleteModelAlert";

export default function ModelsPage() {
  const { data, isLoading, error, refetch, isFetching } = useModels();
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);

  const handleRowClick = (row: Model) => {
    // navegar para a página de detalhes do model
    console.log("Row clicked:", row);
    navigate({
      to: `/model/${row.id}/documents`,
      params: { modelId: row.id },
    });
  };

  // Atualiza o model selecionado ao selecionar/desselecionar linhas na tabela
  const handleSelectionChange = (selectedRows: Model[]) => {
    setSelectedModel(selectedRows.length === 1 ? selectedRows[0] : null);
  };

  if (error) {
    return <div>Erro ao carregar models: {error.message}</div>;
  }

  console.log("Models data:", data);
  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-7xl space-y-8">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-1">
                  Models disponíveis
                </h2>
              </div>
              <div className="flex gap-4 ml-auto mt-4 sm:mt-0">
                {/* Botão para atualizar records */}
                <Button
                  onClick={() => refetch()}
                  disabled={!data?.data?.data || data?.data?.data.length === 0}
                  variant="outline"
                  className="rounded-full h-9 w-9 flex items-center justify-center"
                  title="Atualizar"
                >
                  <RefreshCw className="w-8 h-8" />
                </Button>
                <DeleteModelAlert
                  trigger={
                    <Button
                      variant="outline"
                      disabled={!selectedModel} // desabilita se não houver model selecionado
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </Button>
                  }
                  model={selectedModel}
                  onSuccess={() => setSelectedModel(null)}
                />
                <MutateModelDialog
                  model={selectedModel ?? undefined}
                  trigger={
                    <Button variant="outline" disabled={!selectedModel}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  }
                  onSuccess={() => setSelectedModel(null)}
                />
                {/* Botão para criar novo model */}
                <MutateModelDialog
                  trigger={
                    <Button>
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Criar Model
                    </Button>
                  }
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GenericTable
              columns={modelColumns(handleRowClick)}
              data={data?.data?.data ?? []}
              isLoading={isFetching || isLoading}
              handleRowClick={handleRowClick}
              handleSelectionChange={handleSelectionChange}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

