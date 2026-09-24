import { useNavigate } from 'react-router'
import EmptyState from '../ui/EmptyState'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 52 }}>
      <EmptyState icon="🧭" title="Page not found" message="This page doesn't exist, or you don't have access to it." action="Go home" onAction={() => navigate('/', { replace: true })} />
    </div>
  )
}
