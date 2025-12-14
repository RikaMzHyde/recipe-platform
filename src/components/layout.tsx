// Importamos el tipo ReactNode, que representa cualquier contenido válido como hijo en React
import { ReactNode } from 'react'
// Importamos el componente Footer, que se mostrará en la parte inferior del layout
import { Footer } from './footer'
import { Toaster } from '@/components/ui/toaster'

interface LayoutProps {
  children: ReactNode
}

// Definimos una interfaz (tipo) para las props que recibirá el Layout
// "children" será cualquier elemento React que queramos renderizar dentro del layout
export function Layout({ children }: LayoutProps) {
  return (
    // Contenedor principal del layout que ocupa toda la altura de pantalla
    // "flex flex-col" organiza los elementos en una columna
    <div className="min-h-screen flex flex-col">
      
      {/* Zona principal de la página, donde se renderizan los hijos enviados */}
      {/* flex-1 hace que este bloque ocupe todo el espacio disponible */}
      <main className="flex-1">{children}</main>
      {/* Footer fijo al final del layout */}
      <Footer />
      {/* Toaster para mostrar notificaciones */}
      <Toaster />
    </div>
  )
}
