'use client'

import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ theme: themeProp, ...props }: ToasterProps) => {
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  const resolvedTheme = (themeProp ?? (isDark ? 'dark' : 'light')) as ToasterProps['theme']

  return (
    <Sonner
      theme={resolvedTheme}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
