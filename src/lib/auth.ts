// Definimos la estructura de un usuario usando una interfaz de TypeScript
export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
}

// Obtiene el usuario almacenado en el navegador
export function getUser(): User | null {
  if (typeof window === "undefined") return null
  const userStr = localStorage.getItem("user")
  // Si existe, lo parseamos de JSON a objeto user, sino, null
  return userStr ? JSON.parse(userStr) : null
}

// Guarda un usuario en localStorage
export function setUser(user: User): void {
  // Convertimos el objeti user a JSON y almacenamos
  localStorage.setItem("user", JSON.stringify(user))
}

// Cerrar sesión
export function logout(): void {
  localStorage.removeItem("user")
}

// Login (antiguo)
export function login(email: string, password: string): User | null {
  
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

// Registro (antiguo)
export function register(name: string, email: string, password: string): User | null {
  
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
