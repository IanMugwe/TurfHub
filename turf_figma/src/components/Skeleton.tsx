import type { CSSProperties } from 'react'

export default function Skeleton({ width = '100%', height = 16, radius = 8, style }: { width?: number | string; height?: number | string; radius?: number; style?: CSSProperties }) {
  return <div style={{ width, height, borderRadius: radius, background: 'var(--color-skeleton)', animation: 'skeleton-pulse 1.4s ease-in-out infinite', ...style }} />
}
