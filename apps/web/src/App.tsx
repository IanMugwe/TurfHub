import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'
import { AppStateProvider } from './app/AppState'
import { DemoStoreProvider } from './app/DemoStore'
import { ToastProvider } from './ui/Toast'
import { router } from './app/routes'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppStateProvider>
        <DemoStoreProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </DemoStoreProvider>
      </AppStateProvider>
    </QueryClientProvider>
  )
}
