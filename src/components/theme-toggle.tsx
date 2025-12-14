// Componente que se ejecuta en cliente Next.js App Router
'use client'

import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
// Hook personalizado para acceder al ThemeContext
import { useTheme } from '@/contexts/theme-context'

// Componente que permite alternar entre tema claro y oscuro
export function ThemeToggle() {
  // Obtenemos el tema actual y la función para alternarlo
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      // Al hacer click se invierte el tema
      onClick={toggleTheme}
      className="h-9 w-9 rounded-full"
      title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      suppressHydrationWarning
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 transition-all" />
      ) : (
        <Sun className="h-5 w-5 transition-all" />
      )}
      <span className="sr-only">Cambiar tema</span>
    </Button>
  )
}
