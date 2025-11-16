import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { setUser } from "@/lib/auth"

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AuthDialog({ open, onOpenChange, onSuccess }: AuthDialogProps) {
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error de autenticación" }))
        return setError(err.error || "Credenciales inválidas")
      }
      const user = await res.json()
      setUser(user)
      onSuccess()
      onOpenChange(false)
      setLoginEmail("")
      setLoginPassword("")
    } catch (e) {
      setError("No se pudo conectar con el servidor")
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    // Validar que las contraseñas coincidan
    if (registerPassword !== registerConfirmPassword) {
      return setError("Las contraseñas no coinciden")
    }
    
    // Validar longitud mínima de contraseña
    if (registerPassword.length < 6) {
      return setError("La contraseña debe tener al menos 6 caracteres")
    }
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: registerName, email: registerEmail, password: registerPassword }),
      })
      if (!res.ok) {
        if (res.status === 409) {
          return setError("Ya existe una cuenta asociada a ese email")
        }
        const err = await res.json().catch(() => ({ error: "Error de registro" }))
        return setError(err.error || "No se pudo registrar")
      }
      const user = await res.json()
      setUser(user)
      onSuccess()
      onOpenChange(false)
      setRegisterName("")
      setRegisterEmail("")
      setRegisterPassword("")
      setRegisterConfirmPassword("")
    } catch (e) {
      setError("No se pudo conectar con el servidor")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Bienvenido</DialogTitle>
          <DialogDescription className="text-center">
            Inicia sesión o regístrate para compartir tus recetas
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="register">Registrarse</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Contraseña</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full">
                Iniciar Sesión
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">Nombre</Label>
                <Input
                  id="register-name"
                  type="text"
                  placeholder="Tu nombre"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Contraseña</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="••••••"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-confirm-password">Confirmar contraseña</Label>
                <Input
                  id="register-confirm-password"
                  type="password"
                  placeholder="••••••"
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full">
                Registrarse
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
