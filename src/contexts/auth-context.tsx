// Sistema global de auth (quién es el user autenticado, cómo iniciar y cerrar sesión, cómo actualizar fatos user y compartir ese estado con toda la app mediante contexto de React)
// Esto permite que cualquier componente pueda acceder al usuario actual llamando a useAuth
import React, { createContext, useContext, useState } from "react"

import { getUser as getStoredUser, setUser as setStoredUser, logout as clearStoredUser, type User } from "@/lib/auth"

// Tipo de datos que compartirá el auth con toda la aplicación
interface AuthContextType {
  user: User | null
  login: (user: User) => void
  logout: () => void
  updateUser: (partial: Partial<User>) => void
}

// Creamos el contexto. El valor inicial es undefined para detectar usos fuera del proveedor.
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Gestiona estado global de autenticación y lo expone al resto de componentes
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Cargamos el usuario guardado en localStorage al iniciar la app (si existe), así mantenemos la sesion al recargar
  const [user, setUser] = useState<User | null>(() => getStoredUser())

  // Inicia sesión guardando el usuario tanto en localStorage como en el estado de React
  const login = (newUser: User) => {
    setStoredUser(newUser)
    setUser(newUser)
  }

  // Cierra sesión limpiando el almacenamiento y el estado en memoria
  const logout = () => {
    clearStoredUser()
    setUser(null)
  }

  // Actualiza parcialmente los datos del usuario (por ejemplo nombre o avatar) y los persiste
  const updateUser = (partial: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      const merged = { ...prev, ...partial }
      setStoredUser(merged)
      return merged
    })
  }

  // Hacemos disponible el contexto a toda la app
  return <AuthContext.Provider value={{ user, login, logout, updateUser }}>{children}</AuthContext.Provider>
}

// Hook de ayuda para consumir el contexto de autenticación de forma tipada
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
