import type { ComponentType, ReactNode } from 'react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router'
import { AppStateProvider } from '../app/AppState'
import { DemoStoreProvider } from '../app/DemoStore'
import { ToastProvider } from '../ui/Toast'
import type { Session } from '../types'

/** Render the app's routes at `path`, optionally signed in, with the same providers as App.tsx */
type Providers = {
  AppStateProvider: ComponentType<{ children: ReactNode }>
  DemoStoreProvider: ComponentType<{ children: ReactNode }>
  ToastProvider: ComponentType<{ children: ReactNode }>
}

/** Pass freshly imported providers when a test re-imports the app (e.g. after changing env settings) */
export function renderRoutes(routes: RouteObject[], path: string, session?: Session, providers: Providers = { AppStateProvider, DemoStoreProvider, ToastProvider }) {
  const { AppStateProvider: Provider, DemoStoreProvider: Store, ToastProvider: Toasts } = providers
  if (session) localStorage.setItem('turf.session', JSON.stringify(session))
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <Provider>
        <Store>
          <Toasts><RouterProvider router={router} /></Toasts>
        </Store>
      </Provider>
    </QueryClientProvider>,
  )
  return router
}
