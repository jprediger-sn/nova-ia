import * as React from "react";

import {
  Settings,
  HelpCircle,
  Search,
  Layers,
  Building2,
  Database,
  Settings2,
  LineChart,
  MessageCircle,
} from "lucide-react";

import { NavMain } from "./NavMain";
import { NavSecondary } from "./NavSecondary";
import { NavUser } from "./NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { NavModelSwitch } from "./NavModelSwitch";
import type { Model } from "@/features/models/types/Model";
import { useRouter } from "@tanstack/react-router";

type ModelSidebarProps = React.ComponentProps<typeof Sidebar> & {
  models: Model[];
  activeModelId?: string; // Permite identificar o model ativo
};

export function ModelSidebar({ models, activeModelId, ...props }: ModelSidebarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  const sidebarModels = models.map((m) => ({
    id: String(m.id),
    name: m.name,
    logo: Building2,
  }));

  const data = {
    user: {
      name: user?.email || "Usuário não encontrados",
      email: user?.email || "user@example.com",
      avatar: "",
    },
    navMain: [
      {
        title: "Base de dados",
        url: `/model/${activeModelId}`,
        icon: Database,
        isActive: currentPath.startsWith(`/model/${activeModelId}`),
        items: [
          {
            title: "Documentos",
            url: `/model/${activeModelId}/documents`,
            isActive: currentPath.startsWith(`/model/${activeModelId}/documents`),
          },
          {
            title: "Chunks",
            url: `/model/${activeModelId}/chunks`,
            isActive: currentPath.startsWith(`/model/${activeModelId}/chunks`),
          },
          {
            title: "Conexões",
            url: `/model/${activeModelId}/connections`,
            isActive: currentPath.startsWith(`/model/${activeModelId}/connections`),
          },
        ],
      },
      {
        title: "Configuração RAG", // Agrupa as configurações de forma clara
        url: `/model/${activeModelId}/rag`,
        icon: Settings2,
        isActive: currentPath.startsWith(`/model/${activeModelId}/rag`),
        items: [
          {
            title: "Recuperação", // Focado na primeira parte do RAG
            url: `/model/${activeModelId}/rag/retrieval`,
            isActive: currentPath.startsWith(`/model/${activeModelId}/rag/retrieval`),
          },
          {
            title: "Geração (LLM)", // Focado na segunda parte do RAG
            url: `/model/${activeModelId}/rag/generation`,
            isActive: currentPath.startsWith(`/model/${activeModelId}/rag/generation`),
          },
        ],
      },
      {
        title: "Playground", // Para testes
        url: `/model/${activeModelId}/playground`,
        icon: MessageCircle, // Ícone mais intuitivo
        isActive: currentPath === `/model/${activeModelId}/playground`,
      },
      {
        title: "Versionamento", // Ótima funcionalidade, bem posicionada
        url: `/model/${activeModelId}/versioning`,
        icon: Layers,
        isActive: currentPath === `/model/${activeModelId}/versioning`,
      },
      {
        title: "Monitoramento", // Para análise de performance
        url: `/model/${activeModelId}/monitoring`,
        icon: LineChart, // Ícone mais representativo
        isActive: currentPath === `/model/${activeModelId}/monitoring`,
      },
    ],
    navSecondary: [
      {
        title: "Configurações",
        url: "/settings",
        icon: Settings,
      },
      {
        title: "Ajuda",
        url: "/help",
        icon: HelpCircle,
      },
      {
        title: "Pesquisar",
        url: "/search",
        icon: Search,
      },
    ],
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavModelSwitch models={sidebarModels} activeModelId={activeModelId} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}

