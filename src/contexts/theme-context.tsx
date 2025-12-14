// Para indicar que el archivo debe renderizarse en el cliente, no en el servidor (Vite)
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

// Tipo de tema
type Theme = 'light' | 'dark'

// El contexto compartirá en tema actual y lo necesario para cambiar entre uno y otro
interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

// Creamos el contexto 
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Provider que ofrece acceso al estado del tema para todos los componentes
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Estado del tema por defecto
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  // Se ejecuta solo una vez al montar el componente
  useEffect(() => {
    setMounted(true)
    // Revisar si hay ya un tema o ponemos el por defecto
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme)
    } else {
      // Check system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(systemPrefersDark ? 'dark' : 'light')
    }
  }, [])

  // Se ejecuta al cambiar el tema
  useEffect(() => {
    // Aplica el dark al html
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    // Guarda la preferencia de tema
    localStorage.setItem('theme', theme)
  }, [theme])

  // Alternar entre light y dark
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  // Porveer el contexto a todos los componentes hijos
  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook para consumir el contexto del tema
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
