import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/help')({
  component: () => <div>Hello /_authenticated/help!</div>
})