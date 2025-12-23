import { createFileRoute } from '@tanstack/react-router'
import { ModelDocuments } from '@/features/models'

export const Route = createFileRoute(
  '/_authenticated/model/$modelId/documents',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <ModelDocuments />
}
