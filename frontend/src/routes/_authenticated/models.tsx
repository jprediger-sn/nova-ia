import { ModelsPage } from '@/features/models';
import { Header } from '@/features/layout';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/models')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <Header />
      <ModelsPage />
    </>
  );
}
