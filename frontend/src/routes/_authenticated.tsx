import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    // Se o usuário não estiver autenticado, redirecione para o login
    if (!context.auth.isLoading && !context.auth.user) {
      console.warn("Usuário não autenticado, redirecionando para o login.");
      throw redirect({
        to: '/auth/login',
        search: {
          // Salva a localização original para redirecionar de volta após o login
          redirect: location.href,
        },
      })
    }
  }
})