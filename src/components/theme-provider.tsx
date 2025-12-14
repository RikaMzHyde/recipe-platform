// Componente que se ejecuta en cliente Next.js App Router
'use client'

// Importamos React para usar ReactNode y JSX
import * as React from 'react'

// Definimos las props del componente
type Props = {
  // children representa cualquier componente JSX que se envuelva con ThemeProvider
  children: React.ReactNode
}

// Componente ThemeProvider renderiza hijos
export function ThemeProvider({ children }: Props) {
  return <>{children}</>
}
