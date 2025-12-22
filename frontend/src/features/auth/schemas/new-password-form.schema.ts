import * as z from "zod";

export const requestSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
});

export const confirmSchema = z
  .object({
    code: z
      .string()
      .min(1, { message: "O código de confirmação é obrigatório." }),
    newPassword: z
      .string()
      .min(8, { message: "A nova senha deve ter pelo menos 8 caracteres." })
      .regex(/[a-z]/, { message: "Deve conter ao menos uma letra minúscula." })
      .regex(/[A-Z]/, { message: "Deve conter ao menos uma letra maiúscula." })
      .regex(/[0-9]/, { message: "Deve conter ao menos um número." })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Deve conter ao menos um caractere especial.",
      }),
    confirmPassword: z
      .string()
      .min(8, { message: "A nova senha deve ter pelo menos 8 caracteres." })
      .regex(/[a-z]/, { message: "Deve conter ao menos uma letra minúscula." })
      .regex(/[A-Z]/, { message: "Deve conter ao menos uma letra maiúscula." })
      .regex(/[0-9]/, { message: "Deve conter ao menos um número." })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Deve conter ao menos um caractere especial.",
      }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

// Schema para NEW_PASSWORD_REQUIRED (sem código de verificação)
export const newPasswordRequiredSchema = z
  .object({
    code: z.string().optional(), // Opcional para manter compatibilidade com o formulário
    newPassword: z
      .string()
      .min(8, { message: "A nova senha deve ter pelo menos 8 caracteres." })
      .regex(/[a-z]/, { message: "Deve conter ao menos uma letra minúscula." })
      .regex(/[A-Z]/, { message: "Deve conter ao menos uma letra maiúscula." })
      .regex(/[0-9]/, { message: "Deve conter ao menos um número." })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Deve conter ao menos um caractere especial.",
      }),
    confirmPassword: z
      .string()
      .min(8, { message: "A nova senha deve ter pelo menos 8 caracteres." })
      .regex(/[a-z]/, { message: "Deve conter ao menos uma letra minúscula." })
      .regex(/[A-Z]/, { message: "Deve conter ao menos uma letra maiúscula." })
      .regex(/[0-9]/, { message: "Deve conter ao menos um número." })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Deve conter ao menos um caractere especial.",
      }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });
