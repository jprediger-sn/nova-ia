import { createFileRoute } from '@tanstack/react-router'
import { ModelChunks } from '@/features/models'

export const Route = createFileRoute(
  '/_authenticated/model/$modelId/chunks',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <ModelChunks />
}
