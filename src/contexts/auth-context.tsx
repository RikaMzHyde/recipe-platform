import React, { createContext, useContext, useState } from "react"

import { getUser as getStoredUser, setUser as setStoredUser, logout as clearStoredUser, type User } from "@/lib/auth"

// Tipo de datos que expondrá el contexto de autenticación a toda la app
interface AuthContextType {
  user: User | null
  login: (user: User) => void
  logout: () => void
  updateUser: (partial: Partial<User>) => void
}

// Creamos el contexto. El valor inicial es undefined para detectar usos fuera del proveedor.
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Componente proveedor que envuelve la aplicación y gestiona el estado global de usuario
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Al montar, intentamos leer el usuario persistido (si hay sesión guardada en localStorage)
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

  // Inyectamos el valor del contexto para que cualquier componente hijo pueda usar useAuth()
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
