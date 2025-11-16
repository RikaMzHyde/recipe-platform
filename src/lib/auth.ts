export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null
  const userStr = localStorage.getItem("user")
  return userStr ? JSON.parse(userStr) : null
}

export function setUser(user: User): void {
  localStorage.setItem("user", JSON.stringify(user))
}

export function logout(): void {
  localStorage.removeItem("user")
}

export function login(email: string, password: string): User | null {
  // Simulated login - in production this would call an API
  if (email && password.length >= 6) {
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split("@")[0],
      email,
    }
    setUser(user)
    return user
  }
  return null
}

export function register(name: string, email: string, password: string): User | null {
  // Simulated registration - in production this would call an API
  if (name && email && password.length >= 6) {
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
    }
    setUser(user)
    return user
  }
  return null
}
