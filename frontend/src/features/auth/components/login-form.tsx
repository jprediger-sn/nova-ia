import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "../hooks/use-auth.ts";
import { loginFormSchema, type LoginFormValues } from "../schemas/login-form.schema";
import { AppError } from "@/lib/errors";
import { NewPasswordForm } from "./new-password-form";
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
import novaIALogo from "@/assets/nova_ia_logo_branco.svg";

export function LoginForm() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [newPasswordRequired, setNewPasswordRequired] = useState<{
    session: string;
    email: string;
  } | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      // Se já está autenticado, apenas redireciona
      if (auth.isAuthenticated) {
        navigate({
          to: "/",
          replace: true,
        });
        return;
      }

      if (auth.isAuthenticating) return;
      
      await auth.login({
        username: data.email,
        password: data.password,
      });

      toast.success("Login realizado com sucesso!", {
        position: "top-center",
      });

      navigate({
        to: "/",
        replace: true,
      });
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      
      // Verifica se é o erro de nova senha obrigatória
      if (error instanceof AppError && error.code === "NEW_PASSWORD_REQUIRED") {
        // O Amplify gerencia a sessão internamente, então não precisamos passar explicitamente
        setNewPasswordRequired({
          session: "", // Session é gerenciada internamente pelo Amplify
          email: data.email, // Usa o email do formulário
        });
        return;
      }
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Erro ao fazer login. Verifique suas credenciais e tente novamente.";
      
      toast.error(errorMessage, {
        position: "top-center",
      });
    }
  };

  if (auth.isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Se há necessidade de definir nova senha, mostra o formulário apropriado
  if (newPasswordRequired) {
    return (
      <NewPasswordForm
        isNewPasswordRequired={true}
        session={newPasswordRequired.session}
        email={newPasswordRequired.email}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex items-center gap-2 mb-4">
        <img src={novaIALogo} alt="Logo Nova IA" className="h-12" />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Acesse sua conta</CardTitle>
          <CardDescription>
            Digite seu email e senha para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="seu@email.com"
                        {...field}
                        type="email"
                        autoComplete="email"
                        disabled={auth.isAuthenticating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="••••••••"
                          {...field}
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          disabled={auth.isAuthenticating}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 rounded-md"
                          onClick={() => setShowPassword((prev) => !prev)}
                          aria-label={
                            showPassword ? "Esconder senha" : "Mostrar senha"
                          }
                          disabled={auth.isAuthenticating}
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

              <Button
                type="submit"
                className="w-full"
                disabled={auth.isAuthenticating}
              >
                {auth.isAuthenticating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            <Link to="/reset-password" className="underline text-primary hover:text-primary/80">
              Esqueceu a senha?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


