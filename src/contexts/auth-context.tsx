import React, { createContext, useContext, useState } from "react"

import { getUser as getStoredUser, setUser as setStoredUser, logout as clearStoredUser, type User } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  login: (user: User) => void
  logout: () => void
  updateUser: (partial: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser())

  const login = (newUser: User) => {
    setStoredUser(newUser)
    setUser(newUser)
  }

  const logout = () => {
    clearStoredUser()
    setUser(null)
  }

  const updateUser = (partial: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      const merged = { ...prev, ...partial }
      setStoredUser(merged)
      return merged
    })
  }

  return <AuthContext.Provider value={{ user, login, logout, updateUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
