import { useAuth } from "@/features/auth/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/features/theme";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { useNavigate } from "@tanstack/react-router";

import novaIALogoBranco from "@/assets/nova_ia_logo_branco.svg";

export default function Header() {
  const auth = useAuth();
  const navigate = useNavigate();

  if (auth.isAuthenticating) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  // Função utilitária para pegar as iniciais
  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((n) => n[0]?.toUpperCase())
      .join("")
      .substring(0, 2);
  };

  const handleLogoutClick = () => {
    auth.logout();
    // Redireciona para a página de login após o logout
    navigate({ to: "/auth/login", replace: true });
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-8 py-2 flex items-center justify-between">
      <div className="mx-auto w-full max-w-7xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={novaIALogoBranco}
            alt="Logo Nova IA"
            className="h-6 cursor-pointer"
            onClick={() => navigate({ to: "/" })}
          />
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarImage />
                <AvatarFallback>
                  {getInitials(auth.user?.email || "U S")}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{auth.user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogoutClick}
                className="text-destructive focus:bg-red-100 focus:text-red-600 font-semibold cursor-pointer"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}


