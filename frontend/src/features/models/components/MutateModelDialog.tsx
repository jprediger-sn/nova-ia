import { useState, useEffect } from "react";
import { useCreateModel, useUpdateModel } from "../api/ModelsApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

import { type CreateModel } from "../types/CreateModel";
import { type UpdateModel } from "../types/UpdateModel";
import { type Model } from "../types/Model";

type MutateModelDialogProps = {
  model?: Model | null;
  trigger: React.ReactNode;
  onSuccess?: () => void;
};

export function MutateModelDialog({
  model,
  trigger,
  onSuccess,
}: MutateModelDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  // Hooks para create e update
  const {
    mutate: createModel,
    isPending: isCreating,
  } = useCreateModel();
  const {
    mutate: updateModel,
    isPending: isUpdating,
  } = useUpdateModel();

  // Preenche os campos se for edição
  useEffect(() => {
    if (model) {
      setName(model.name || "");
    } else {
      setName("");
    }
  }, [model, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (model) {
      // Update
      const payload: UpdateModel = {
        id: model.id,
        name,
      };
      updateModel(payload, {
        onSuccess: () => {
          setOpen(false);
          if (onSuccess) onSuccess();
        },
      });
    } else {
      // Create
      const payload: CreateModel = {
        name,
      };
      createModel(payload, {
        onSuccess: () => {
          setOpen(false);
          setName("");
          if (onSuccess) onSuccess();
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {model ? "Editar Model" : "Criar novo Model"}
          </DialogTitle>
          <DialogDescription>
            {model
              ? "Altere os campos desejados e salve as alterações."
              : "Preencha os campos abaixo para criar um novo model."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isCreating || isUpdating}
            >
              {(isCreating || isUpdating) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {model ? "Salvando..." : "Criando..."}
                </>
              ) : (
                model ? "Salvar" : "Criar"
              )}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

