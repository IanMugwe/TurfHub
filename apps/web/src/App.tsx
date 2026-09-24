import { RouterProvider } from 'react-router'
import { AppStateProvider } from './app/AppState'
import { router } from './app/routes'

export default function App() {
  return (
    <AppStateProvider>
      <RouterProvider router={router} />
    </AppStateProvider>
  )
}
