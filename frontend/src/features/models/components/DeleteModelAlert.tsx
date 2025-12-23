import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeleteModel } from "../api/ModelsApi";
import type { Model } from "../types/Model";
import { Loader2 } from "lucide-react";

export function DeleteModelAlert({
  trigger,
  model,
  onSuccess,
}: {
  trigger: React.ReactNode;
  model: Model | null;
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { mutate: deleteModel, isPending } = useDeleteModel();

  const handleDelete = (event: React.MouseEvent) => {
    event.preventDefault();

    if (!model) return;

    deleteModel(model.id, {
      onSuccess: () => {
        setOpen(false);
        if (onSuccess) onSuccess();
      },
      // Opcional, mas recomendado: tratar o erro
      // onError: (error) => {
      //   // Você pode mostrar uma notificação de erro aqui
      //   console.error(error.message);
      // }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      {model && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O model <b>{model?.name}</b>{" "}
              será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {"Excluindo..."}
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}

