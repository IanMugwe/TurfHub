import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router'
import { AppStateProvider } from '../app/AppState'
import type { Session } from '../types'

/** Render the app's routes at `path`, optionally signed in, with the same providers as App.tsx */
export function renderRoutes(routes: RouteObject[], path: string, session?: Session, Provider = AppStateProvider) {
  if (session) localStorage.setItem('turf.session', JSON.stringify(session))
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <Provider><RouterProvider router={router} /></Provider>
    </QueryClientProvider>,
  )
  return router
}
