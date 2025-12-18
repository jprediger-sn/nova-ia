import { AuthProvider } from '@/features/auth'

function App() {
  return (
    <AuthProvider>
      {/* Sua aplicação aqui */}
      <div>App content</div>
    </AuthProvider>
  )
}

export default App
