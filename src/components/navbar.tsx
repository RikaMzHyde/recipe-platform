import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { AuthDialog } from "@/components/auth-dialog"
import { getUser, logout, type User } from "@/lib/auth"
import { ChefHat, Heart, LogOut, UserIcon, Plus } from "lucide-react"
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
  const [user, setUser] = useState<User | null>(null)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)

  useEffect(() => {
    setUser(getUser())
  }, [])

  const handleLogout = () => {
    logout()
    setUser(null)
    // Recargar la página para limpiar el estado de favoritos
    window.location.href = "/"
  }

  const handleAuthSuccess = () => {
    setUser(getUser())
    // Recargar la página para cargar los favoritos del usuario
    window.location.reload()
  }

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-3 sm:px-4 md:px-6 lg:px-6 mx-auto w-full flex h-16 items-center justify-between flex-wrap">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <ChefHat className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Kokumi</span>
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            {user && (
              <Button asChild variant="default" size="sm">
                <Link to="/create-recipe" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">¡Comparte una nueva receta!</span>
                </Link>
              </Button>
            )}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-md h-9 px-4 text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    <UserIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">¡Bienvenid@ {user.name}!</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>¿Qué quieres hacer?</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="flex items-center gap-2 cursor-pointer">
                      <UserIcon className="h-4 w-4" />
                      Mi Cuenta
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

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} onSuccess={handleAuthSuccess} />
    </>
  )
}