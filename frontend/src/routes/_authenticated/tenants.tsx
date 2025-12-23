import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/tenants')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/tenants"!</div>
}
