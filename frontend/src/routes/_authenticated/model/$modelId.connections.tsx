import { createFileRoute } from '@tanstack/react-router'
import { ModelConnections } from '@/features/models'

export const Route = createFileRoute(
  '/_authenticated/model/$modelId/connections',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <ModelConnections />
}
