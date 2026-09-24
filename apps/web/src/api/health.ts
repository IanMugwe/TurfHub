import { useQuery } from '@tanstack/react-query'
import { healthResponseSchema } from '@turfhub/validation'
import { apiGet } from './client'

export type ApiStatus = 'checking' | 'online' | 'degraded' | 'offline'

/** API health, re-checked every 30 s while the page is open */
export function useApiHealth(): ApiStatus {
  const { data, isError, isPending } = useQuery({
    queryKey: ['health'],
    queryFn: ({ signal }) => apiGet('/health', healthResponseSchema, { acceptStatuses: [503], signal }),
    refetchInterval: 30_000,
    retry: false,
  })
  if (isPending) return 'checking'
  if (isError) return 'offline'
  return data.status === 'ok' ? 'online' : 'degraded'
}
