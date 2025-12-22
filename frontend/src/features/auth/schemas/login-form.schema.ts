import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email é obrigatório' })
    .email({ message: 'Formato de email inválido' }),

  password: z
    .string()
    .min(8, { message: 'A senha deve ter no mínimo 8 caracteres.' })
    .max(100, { message: 'A senha deve ter no máximo 100 caracteres.' })
    .regex(/[A-Z]/, { message: "A senha deve conter ao menos uma letra maiúscula" })
    .regex(/[a-z]/, { message: "A senha deve conter ao menos uma letra minúscula" })
    .regex(/[0-9]/, { message: "A senha deve conter ao menos um número" })
    .regex(/[^a-zA-Z0-9]/, { message: "A senha deve conter ao menos um caractere especial" })
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;



