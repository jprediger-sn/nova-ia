import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/search')({
  component: () => <div>Hello /_authenticated/search!</div>
})