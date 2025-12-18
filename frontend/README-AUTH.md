# Estrutura de Autenticação

## Organização de Arquivos (Padrão Moderno)

A estrutura segue o padrão de **feature-based organization** com nomenclatura **kebab-case**:

```
src/
├── features/
│   └── auth/
│       ├── components/
│       │   └── login-form.tsx          # Componente de login
│       ├── contexts/
│       │   └── auth-context.tsx        # Context de autenticação
│       ├── schemas/
│       │   └── login-form.schema.ts    # Schema de validação Zod
│       ├── types/
│       │   └── auth.types.ts           # Tipos TypeScript
│       └── index.ts                    # Barrel exports
├── lib/
│   └── cognito/
│       ├── config.ts                   # Configuração do Cognito
│       ├── client.ts                   # Cliente Cognito
│       └── amplify-config.ts           # Configuração do Amplify
└── components/
    └── ui/                             # Componentes shadcn/ui
```

## Uso

### 1. Configuração do SST

O `sst.config.ts` já está configurado para expor as variáveis de ambiente do Cognito:
- `VITE_COGNITO_USER_POOL_ID`
- `VITE_COGNITO_CLIENT_ID`
- `VITE_COGNITO_REGION`

### 2. Usar o AuthProvider

No `App.tsx` ou `main.tsx`:

```tsx
import { AuthProvider } from '@/features/auth';

function App() {
  return (
    <AuthProvider>
      {/* Sua aplicação */}
    </AuthProvider>
  );
}
```

### 3. Usar o hook useAuth

```tsx
import { useAuth } from '@/features/auth';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // ...
}
```

### 4. Usar o LoginForm

```tsx
import { LoginForm } from '@/features/auth';

function LoginPage() {
  return <LoginForm />;
}
```

## Dependências Necessárias

Certifique-se de ter instalado:

```bash
npm install @aws-amplify/auth aws-amplify
```

## Próximos Passos

1. Configurar rotas com TanStack Router
2. Criar rotas protegidas
3. Implementar redirecionamento após login


