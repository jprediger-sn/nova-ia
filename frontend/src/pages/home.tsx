import { useAuth } from '@/features/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function HomePage() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Nova IA</h1>
            <p className="text-muted-foreground">Bem-vindo, {user?.email}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Sair
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>
              Área principal da aplicação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Email:</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              {user?.tenantId && (
                <div>
                  <p className="text-sm text-muted-foreground">Tenant ID:</p>
                  <p className="font-medium">{user.tenantId}</p>
                </div>
              )}
              {user?.role && (
                <div>
                  <p className="text-sm text-muted-foreground">Role:</p>
                  <p className="font-medium">{user.role}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

