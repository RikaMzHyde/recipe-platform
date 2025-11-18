import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { AuthDialog } from "@/components/auth-dialog"
import { useAuth } from "@/contexts/auth-context"
import { ChefHat, Heart, LogOut, UserIcon, Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
  const navigate = useNavigate()
  // Obtenemos del contexto global el usuario autenticado y la función para cerrar sesión
  const { user, logout } = useAuth()
  // Estado local para controlar si el diálogo de login/registro está abierto
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleLogout = () => {
    logout()
    // Recargar la página para limpiar el estado de favoritos
    window.location.href = "/"
  }

  const handleAuthSuccess = () => {
    // El estado de usuario se actualiza desde AuthProvider
  }

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-3 sm:px-4 md:px-6 lg:px-6 mx-auto w-full flex h-16 items-center justify-between flex-wrap">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-15 w-15 items-center justify-center rounded-full bg-primary overflow-hidden">
              <img
                src="/kokumi-logo.png"
                alt="Kokumi logo"
                className="h-15 w-15 object-contain"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xl sm:text-5xl font-semibold tracking-tight kokumi-logo-text">Kokumi</span>
              <span className="hidden sm:inline text-xs font-medium tracking-wide text-muted-foreground">
                Recetas con sabor casero
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {/* Si hay usuario autenticado mostramos acceso directo a crear una receta */}
            {user && (
              <Button asChild variant="default" size="sm">
                <Link to="/create-recipe" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">¡Comparte una nueva receta!</span>
                </Link>
              </Button>
            )}
            {/* Si hay sesión mostramos el menú de cuenta; si no, el botón para abrir AuthDialog */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-md h-9 px-4 text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 border">
                      <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
                      <AvatarFallback>{user.name ? user.name[0] : "?"}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">¡Bienvenid@ {user.name}!</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>¿Qué quieres hacer?</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      Mi Cuenta
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-recipes" className="flex items-center gap-2 cursor-pointer">
                      <ChefHat className="h-4 w-4" />
                      Mis Recetas
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/favorites" className="flex items-center gap-2 cursor-pointer">
                      <Heart className="h-4 w-4" />
                      Mis Favoritos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer">
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => setAuthDialogOpen(true)}>¡Únete a la mesa!</Button>
            )}
          </div>
        </div>
      </nav>

      {/* Diálogo de autenticación controlado por el estado local authDialogOpen */}
      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen} 
        onSuccess={handleAuthSuccess} 
      />
    </>
  )
}