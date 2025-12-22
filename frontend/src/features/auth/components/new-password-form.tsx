import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, RotateCcwKey, KeyRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useAuth } from "../hooks/use-auth";
import { confirmSchema, requestSchema, newPasswordRequiredSchema } from "../schemas/new-password-form.schema";
import { z } from "zod";

interface NewPasswordFormProps {
  /**
   * Quando true, o formulário é usado para NEW_PASSWORD_REQUIRED (sem código de verificação)
   * Quando false ou undefined, é usado para reset de senha (com código)
   */
  isNewPasswordRequired?: boolean;
  /**
   * Email do usuário (usado quando isNewPasswordRequired é true)
   */
  email?: string;
  /**
   * Session do challenge (usado quando isNewPasswordRequired é true)
   */
  session?: string;
}

export function NewPasswordForm({ 
  isNewPasswordRequired = false, 
  email: initialEmail = "",
  session = "" 
}: NewPasswordFormProps = {}) {
  const [step, setStep] = useState<"request" | "confirm">(
    isNewPasswordRequired ? "confirm" : "request"
  );
  const [submittedEmail, setSubmittedEmail] = useState<string>(initialEmail);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const auth = useAuth();
  const navigate = useNavigate();

  const requestForm = useForm<{ email: string }>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: "" },
  });

  // Tipos diferentes baseados no modo
  type ConfirmFormValues = typeof isNewPasswordRequired extends true
    ? z.infer<typeof newPasswordRequiredSchema>
    : z.infer<typeof confirmSchema>;

  const confirmForm = useForm<ConfirmFormValues>({
    resolver: zodResolver(
      isNewPasswordRequired ? newPasswordRequiredSchema : confirmSchema
    ) as any,
    defaultValues: { 
      code: "", 
      newPassword: "", 
      confirmPassword: "" 
    } as ConfirmFormValues,
  });

  // Limpa erros ao mudar de etapa e reseta formulários
  useEffect(() => {
    if (step === "request") {
      requestForm.reset({ email: submittedEmail || "" });
    } else {
      confirmForm.reset({ code: "", newPassword: "" });
    }
    // eslint-disable-next-line
  }, [step]);

  // Envio do formulário de requisição de código
  const onSubmitRequest = async (data: { email: string }) => {
    try {
      await auth.resetPassword(data.email);
      setSubmittedEmail(data.email);
      setStep("confirm");
      toast.success(
        "Código de verificação enviado para o e-mail. Verifique sua caixa de entrada.",
        {
          position: "top-center",
        }
      );
    } catch (err: any) {
      // Trata erro específico de limite excedido
      if (
        err?.name === "LimitExceededException" ||
        err?.code === "LimitExceededException" ||
        (typeof err?.toString === "function" &&
          err.toString().includes("LimitExceededException"))
      ) {
        toast.error(
          "Você excedeu o número de tentativas. Por favor, tente novamente mais tarde.",
          {
            position: "top-center",
          }
        );
      } else {
        toast.error(
          err.message ||
            "Erro ao enviar o código de verificação. Por favor, tente novamente.",
          {
            position: "top-center",
          }
        );
      }
    }
  };

  // Envio do formulário de confirmação de nova senha
  const onSubmitConfirm = async (data: ConfirmFormValues) => {
    try {
      // Se é NEW_PASSWORD_REQUIRED, usa confirmNewPassword
      if (isNewPasswordRequired) {
        const formData = data as z.infer<typeof newPasswordRequiredSchema>;
        await auth.confirmNewPassword(session, formData.newPassword);
        toast.success("Senha definida com sucesso!", {
          position: "top-center",
        });
        navigate({
          to: "/",
          replace: true,
        });
        return;
      }

      // Caso contrário, é reset de senha (precisa de código)
      const formData = data as z.infer<typeof confirmSchema>;
      await auth.confirmResetPassword(
        submittedEmail,
        formData.code,
        formData.newPassword
      );
      toast.success("Senha redefinida com sucesso!", {
        position: "top-center",
      });
      navigate({
        to: "/login",
        replace: true,
      });
    } catch (err: any) {
      toast.error(
        err.message ||
          "Erro ao confirmar a nova senha. Por favor, tente novamente.",
        {
          position: "top-center",
        }
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center">
            {isNewPasswordRequired ? (
              <KeyRound className="h-12 w-12 text-[hsl(var(--chart-1))]" />
            ) : (
              <RotateCcwKey className="h-12 w-12 text-[hsl(var(--chart-1))]" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {step === "request" ? "Recuperar Senha" : "Definir Nova Senha"}
          </CardTitle>
          <CardDescription>
            {step === "request"
              ? "Informe seu e-mail para enviarmos um código de verificação."
              : isNewPasswordRequired
              ? "Você precisa definir uma nova senha para continuar."
              : "Insira o código recebido e sua nova senha."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "request" && (
            <Form {...requestForm}>
              <form
                onSubmit={requestForm.handleSubmit(onSubmitRequest)}
                className="space-y-6"
              >
                <FormField
                  control={requestForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="seu@email.com"
                          autoComplete="email"
                          disabled={requestForm.formState.isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={requestForm.formState.isSubmitting}
                >
                  {requestForm.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Enviar Código
                </Button>
              </form>
            </Form>
          )}

          {step === "confirm" && (
            <Form {...confirmForm}>
              <form
                onSubmit={confirmForm.handleSubmit(onSubmitConfirm)}
                className="space-y-6"
              >
                {isNewPasswordRequired && (
                  <div className="text-sm text-muted-foreground text-center">
                    <p>Email: {submittedEmail || initialEmail}</p>
                  </div>
                )}
                
                {!isNewPasswordRequired && (
                  <FormField
                    control={confirmForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código de Verificação</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder="123456"
                            autoComplete="one-time-code"
                            disabled={confirmForm.formState.isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={confirmForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            disabled={confirmForm.formState.isSubmitting}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={
                              showPassword ? "Esconder senha" : "Mostrar senha"
                            }
                            disabled={confirmForm.formState.isSubmitting}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={confirmForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Nova Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showConfirm ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            disabled={confirmForm.formState.isSubmitting}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md"
                            onClick={() => setShowConfirm((prev) => !prev)}
                            aria-label={
                              showConfirm ? "Esconder senha" : "Mostrar senha"
                            }
                            disabled={confirmForm.formState.isSubmitting}
                          >
                            {showConfirm ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={confirmForm.formState.isSubmitting}
                >
                  {confirmForm.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isNewPasswordRequired ? "Definir Nova Senha" : "Confirmar Nova Senha"}
                </Button>
                {!isNewPasswordRequired && (
                  <div className="justify-center text-sm mt-2 w-full flex flex-wrap items-center gap-1">
                    <span>Não recebeu o código?</span>
                    <button
                      type="button"
                      className="underline text-primary cursor-pointer bg-transparent border-none p-0 m-0"
                      style={{ display: "inline", width: "auto" }}
                      onClick={() => setStep("request")}
                      disabled={confirmForm.formState.isSubmitting}
                    >
                      Enviar novamente
                    </button>
                    <span>para {submittedEmail || "seu e-mail"}</span>
                  </div>
                )}
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
