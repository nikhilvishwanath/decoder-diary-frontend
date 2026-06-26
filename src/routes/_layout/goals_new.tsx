import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/goals_new')({
  component: () => <div>Hello /_layout/goals_new!</div>
})