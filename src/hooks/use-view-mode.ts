import { useState, useEffect } from 'react'

export function useViewMode(key: string, defaultMode: 'cards' | 'table' = 'cards') {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(() => {
    const saved = localStorage.getItem(`view-mode-${key}`)
    return (saved as 'cards' | 'table') || defaultMode
  })

  useEffect(() => {
    localStorage.setItem(`view-mode-${key}`, viewMode)
  }, [viewMode, key])

  return [viewMode, setViewMode] as const
}
