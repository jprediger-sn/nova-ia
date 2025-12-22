import { useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { AdminUser, CreateUserPayload, UpdateUserPayload, UserRole } from "../types";

const baseSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().min(2, "Mínimo 2 caracteres").optional().or(z.literal("")),
  tenantId: z.string().optional(),
  role: z.enum(["admin", "manager", "viewer"] as [UserRole, UserRole, UserRole]).optional(),
  temporaryPassword: z.string().min(8, "Mínimo 8 caracteres").optional().or(z.literal("")),
});

const editSchema = baseSchema.extend({
  email: z.string().email().optional(),
});

type CreateFormValues = z.infer<typeof baseSchema>;
type EditFormValues = z.infer<typeof editSchema>;

interface UserFormProps {
  mode: "create" | "edit";
  defaultTenantId: string;
  initialData?: AdminUser | null;
  onSubmitCreate: (data: CreateUserPayload) => Promise<void>;
  onSubmitEdit: (username: string, data: UpdateUserPayload) => Promise<void>;
  onCancelEdit: () => void;
}

export function UserForm({
  mode,
  defaultTenantId,
  initialData,
  onSubmitCreate,
  onSubmitEdit,
  onCancelEdit,
}: UserFormProps) {
  const form = useForm<CreateFormValues | EditFormValues>({
    resolver: zodResolver(mode === "create" ? baseSchema : editSchema),
    defaultValues: {
      email: initialData?.email ?? "",
      name: initialData?.name ?? "",
      tenantId: initialData?.tenantId ?? defaultTenantId,
      role: initialData?.role ?? "viewer",
      temporaryPassword: "",
    },
  });

  useEffect(() => {
    form.reset({
      email: initialData?.email ?? "",
      name: initialData?.name ?? "",
      tenantId: initialData?.tenantId ?? defaultTenantId,
      role: initialData?.role ?? "viewer",
      temporaryPassword: "",
    });
  }, [initialData, defaultTenantId, form]);

  const handleSubmit = async (values: CreateFormValues | EditFormValues) => {
    if (mode === "create") {
      await onSubmitCreate({
        email: values.email as string,
        name: values.name || undefined,
        tenantId: values.tenantId || undefined,
        role: values.role,
        temporaryPassword: values.temporaryPassword || undefined,
      });
      form.reset({
        email: "",
        name: "",
        tenantId: defaultTenantId,
        role: "viewer",
        temporaryPassword: "",
      });
      return;
    }

    if (!initialData) return;

    await onSubmitEdit(initialData.username, {
      name: values.name || undefined,
      tenantId: values.tenantId || undefined,
      role: values.role,
    });
  };

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">
            {mode === "create" ? "Criar usuário" : "Editar usuário"}
          </p>
          <p className="text-xs text-muted-foreground">
            Preencha os campos para {mode === "create" ? "criar" : "atualizar"} um usuário
          </p>
        </div>
        {mode === "edit" && (
          <Button variant="ghost" size="sm" onClick={onCancelEdit}>
            Cancelar
          </Button>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="usuario@empresa.com"
                    disabled={mode === "edit"}
                    {...field}
                    type="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tenantId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tenant ID</FormLabel>
                <FormControl>
                  <Input placeholder="tenant-123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  >
                    <option value="admin">admin</option>
                    <option value="manager">manager</option>
                    <option value="viewer">viewer</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {mode === "create" && (
            <FormField
              control={form.control}
              name="temporaryPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha temporária (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Gerada automaticamente se vazio" {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="md:col-span-2 flex justify-end gap-2">
            {mode === "edit" && (
              <Button type="button" variant="outline" onClick={onCancelEdit}>
                Cancelar
              </Button>
            )}
            <Button type="submit">
              {mode === "create" ? "Criar usuário" : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

