import type { IconProps } from './TabBar'

export function HomeIcon({ size = 22, color = 'currentColor' }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" /><path d="M9 21V12h6v9" stroke={color} strokeWidth="1.8" strokeLinejoin="round" /></svg>
}

export function CalIcon({ size = 22, color = 'currentColor' }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="17" rx="2" stroke={color} strokeWidth="1.8" /><line x1="3" y1="9" x2="21" y2="9" stroke={color} strokeWidth="1.8" /><line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth="1.8" strokeLinecap="round" /><line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth="1.8" strokeLinecap="round" /><rect x="7" y="13" width="3" height="3" rx="0.5" fill={color} /></svg>
}

export function PeopleIcon({ size = 22, color = 'currentColor' }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7" r="4" stroke={color} strokeWidth="1.8" /><path d="M2 21c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke={color} strokeWidth="1.8" strokeLinecap="round" /><path d="M16 3.5a4 4 0 010 7" stroke={color} strokeWidth="1.8" strokeLinecap="round" /><path d="M22 21c0-3.866-2.686-7-6-7" stroke={color} strokeWidth="1.8" strokeLinecap="round" /></svg>
}

export function ChartIcon({ size = 22, color = 'currentColor' }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="3" y="13" width="4" height="8" rx="1" fill={color} /><rect x="10" y="8" width="4" height="13" rx="1" fill={color} /><rect x="17" y="4" width="4" height="17" rx="1" fill={color} /></svg>
}

export function MoreIcon({ size = 22, color = 'currentColor' }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.5" fill={color} /><circle cx="12" cy="12" r="1.5" fill={color} /><circle cx="12" cy="19" r="1.5" fill={color} /></svg>
}

export function SearchIcon({ size = 22, color = 'currentColor' }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke={color} strokeWidth="1.8" /><path d="M16.5 16.5L21 21" stroke={color} strokeWidth="1.8" strokeLinecap="round" /></svg>
}

export function BookIcon({ size = 22, color = 'currentColor' }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" stroke={color} strokeWidth="1.8" /><line x1="8" y1="7" x2="16" y2="7" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><line x1="8" y1="11" x2="16" y2="11" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><line x1="8" y1="15" x2="12" y2="15" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></svg>
}

export function PersonIcon({ size = 22, color = 'currentColor' }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.8" /><path d="M4 21c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke={color} strokeWidth="1.8" strokeLinecap="round" /></svg>
}
