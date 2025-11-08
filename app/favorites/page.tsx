"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import { RecipeCard } from "@/components/recipe-card"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import type { Recipe } from "@/lib/recipes"
import { getUser } from "@/lib/auth"

export default function FavoritesPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(getUser())
  const [favorites, setFavorites] = useState<string[]>([])
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([])

  useEffect(() => {
    const currentUser = getUser()
    setUser(currentUser)

    if (!currentUser) {
      navigate("/")
      return
    }

    ;(async () => {
      try {
        // 1) Obtener IDs de favoritos del usuario
        const favRes = await fetch(`/api/users/${currentUser.id}/favorites`)
        if (!favRes.ok) throw new Error("Error al cargar favoritos")
        const favData: { userId: string; recipeId: string }[] = await favRes.json()
        const favoriteIds = favData.map((f) => f.recipeId)
        setFavorites(favoriteIds)

        // 2) Cargar recetas y filtrar por IDs
        const recRes = await fetch(`/api/recipes`)
        if (!recRes.ok) throw new Error("Error al cargar recetas")
        const allRecipes: Recipe[] = await recRes.json()
        setFavoriteRecipes(allRecipes.filter((r) => favoriteIds.includes(r.id)))
      } catch (e) {
        console.error(e)
      }
    })()
  }, [navigate])

  const handleFavoriteToggle = async (recipeId: string) => {
    if (!user) return
    try {
      await fetch(`/api/users/${user.id}/favorites/${recipeId}`, { method: "DELETE" })
      const newFavorites = favorites.filter((id) => id !== recipeId)
      setFavorites(newFavorites)
      setFavoriteRecipes((prev) => prev.filter((r) => r.id !== recipeId))
    } catch (e) {
      console.error(e)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container px-3 sm:px-4 md:px-6 lg:px-10 max-w-none mx-auto w-full py-6 sm:py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Heart className="h-6 w-6 text-primary fill-current" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-balance">Mis Recetas Favoritas</h1>
              <p className="text-muted-foreground">
                {favoriteRecipes.length === 0
                  ? "Aún no has guardado ninguna receta"
                  : `${favoriteRecipes.length} ${favoriteRecipes.length === 1 ? "receta guardada" : "recetas guardadas"}`}
              </p>
            </div>
          </div>
        </div>

        {favoriteRecipes.length > 0 ? (
          <div className="grid [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] gap-6">
            {favoriteRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} onFavoriteToggle={handleFavoriteToggle} isFavorite={true} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
              <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No tienes favoritos aún</h2>
            <p className="text-muted-foreground mb-6 max-w-md text-pretty">
              Explora nuestras deliciosas recetas y guarda tus favoritas haciendo clic en el corazón
            </p>
            <Button onClick={() => navigate("/")} size="lg" className="rounded-full">
              Explorar Recetas
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
