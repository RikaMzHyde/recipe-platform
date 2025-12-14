// Página de perfil de usuario: muestra la información pública del usuario y sus recetas

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RecipeCard } from "@/components/recipe-card"
import type { Recipe } from "@/lib/recipes"
import { API_URL } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

// Forma del objeto para indicar las propiedades que debe tener
interface PublicUser {
  id: string
  name: string
  avatarUrl?: string | null
}

export default function UserProfilePage() {
  // Obtener ID usaurio por URL
  const { id } = useParams<{ id: string }>()
  // Usuario autenticado para saber si puede marcar favs
  const { user: authUser } = useAuth()
  // Estado del perfil público
  const [user, setUser] = useState<PublicUser | null>(null)
  // Recetas creadas por el usuario
  const [recipes, setRecipes] = useState<Recipe[]>([])
  // Estados de carga y error para feedback al usuario
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Favoritos del usuario autenticado
  const [favorites, setFavorites] = useState<string[]>([])

  // Cargar info del perfil y recetas
  useEffect(() => {
    if (!id) return

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        // Traer recetas del usuario
        const recRes = await fetch(`${API_URL}/api/users/${id}/recipes`)
        if (!recRes.ok) throw new Error("Error al cargar las recetas del usuario")
        const userRecipes: Recipe[] = await recRes.json()
        setRecipes(userRecipes)

        // Intentar cargar datos públicos del usuario, sino usamos datos que vienen de las recetas
        try {
          const userRes = await fetch(`${API_URL}/api/users/${id}`)
          if (userRes.ok) {
            const u = await userRes.json()
            setUser({ id: u.id, name: u.name, avatarUrl: u.avatarUrl })
          } else if (userRecipes.length > 0) {
            const first = userRecipes[0]
            setUser({ id, name: first.userName, avatarUrl: first.userAvatar })
          }
        } catch {
          // Respaldo si el endpoint público falla
          if (userRecipes.length > 0) {
            const first = userRecipes[0]
            setUser({ id, name: first.userName, avatarUrl: first.userAvatar })
          }
        }

        // Cargar favoritos del usuario autenticado para pintar corazones (si hay user iniciado sesión)
        if (authUser) {
          try {
            const favRes = await fetch(`${API_URL}/api/users/${authUser.id}/favorites`)
            if (favRes.ok) {
              const favData: { userId: string; recipeId: string }[] = await favRes.json()
              setFavorites(favData.map((f) => f.recipeId))
            }
          } catch (e) {
            console.error(e)
          }
        } else {
          setFavorites([])
        }
      } catch (e) {
        console.error(e)
        setError("No se pudo cargar la información de este usuario")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id, authUser])

  // Función para marcar/desmarcar favoritos
  const handleFavoriteToggle = async (recipeId: string) => {
    if (!authUser) {
      alert("Debes iniciar sesión para guardar favoritos")
      return
    }

    try {
      // Si ya es fav, lo elimina
      if (favorites.includes(recipeId)) {
        await fetch(`${API_URL}/api/users/${authUser.id}/favorites/${recipeId}`, { method: "DELETE" })
        setFavorites((prev) => prev.filter((id) => id !== recipeId))
      // Sino, lo añade
      } else {
        await fetch(`${API_URL}/api/users/${authUser.id}/favorites`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeId }),
        })
        setFavorites((prev) => [...prev, recipeId])
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Nombre de usuario
  const title = user?.name || "Usuario"

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Contenedor principal */}
      <main className="container px-3 sm:px-4 md:px-6 lg:px-10 max-w-none mx-auto w-full py-8 space-y-8">
        {/* Tarjeta de perfil de user */}
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.avatarUrl || undefined} alt={title} />
                <AvatarFallback>{title.charAt(0) || "?"}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl sm:text-3xl">{title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {recipes.length === 0
                    ? "Aún no ha publicado recetas."
                    : `${recipes.length} ${recipes.length === 1 ? "receta publicada" : "recetas publicadas"}`}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading && (
              <p className="text-sm text-muted-foreground">Cargando información del usuario...</p>
            )}
            {error && !loading && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </CardContent>
        </Card>

        {/* Lsita de recetas si no ha habido problemas */}
        {!loading && !error && recipes.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Recetas de {title}</h2>
            <div className="grid [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] gap-6">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  hideAuthor
                  onFavoriteToggle={handleFavoriteToggle}
                  isFavorite={favorites.includes(recipe.id)}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
