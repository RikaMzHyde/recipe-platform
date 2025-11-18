import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import type { Recipe } from "@/lib/recipes"
import { MyRecipeCard } from "@/components/my-recipe-card"
import { API_URL } from "@/lib/api"

export default function MyRecipesPage() {
  const { user } = useAuth()
  const [myRecipesIds, setMyRecipesIds] = useState<string[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([])
  const [statusMsg, setStatusMsg] = useState<string>("")
  const [statusMsgType, setStatusMsgType] = useState<"success" | "error">("success")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const load = async () => {
      try {
        const recRes = await fetch(`${API_URL}/api/recipes`)
        if (!recRes.ok) throw new Error("Error al cargar recetas")
        const recData: Recipe[] = await recRes.json()
        setAllRecipes(recData)

        const mineRes = await fetch(`${API_URL}/api/users/${user.id}/recipes`)
        if (!mineRes.ok) throw new Error("Error al cargar mis recetas")
        const mineData: Recipe[] = await mineRes.json()
        setMyRecipesIds(mineData.map((m) => m.id))

        const favRes = await fetch(`${API_URL}/api/users/${user.id}/favorites`)
        if (!favRes.ok) throw new Error("Error al cargar favoritos")
        const favData: { userId: string; recipeId: string }[] = await favRes.json()
        setFavorites(favData.map((f) => f.recipeId))
      } catch (e) {
        console.error(e)
        setStatusMsg("Error al cargar tus recetas")
        setStatusMsgType("error")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user])

  const myRecipes = allRecipes.filter((r) => myRecipesIds.includes(r.id))

  const toggleFavorite = async (recipeId: string) => {
    if (!user) return
    try {
      if (favorites.includes(recipeId)) {
        await fetch(`${API_URL}/api/users/${user.id}/favorites/${recipeId}`, { method: "DELETE" })
        setFavorites((prev) => prev.filter((id) => id !== recipeId))
      } else {
        await fetch(`${API_URL}/api/users/${user.id}/favorites`, {
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

  const handleDeleteRecipe = (recipeId: string) => {
    setAllRecipes((prev) => prev.filter((r) => r.id !== recipeId))
    setMyRecipesIds((prev) => prev.filter((id) => id !== recipeId))
    setFavorites((prev) => prev.filter((id) => id !== recipeId))
    setStatusMsg("Receta eliminada correctamente")
    setStatusMsgType("success")
    setTimeout(() => setStatusMsg(""), 2000)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container px-3 sm:px-4 md:px-6 lg:px-10 max-w-none mx-auto w-full py-8">
          <Card className="max-w-xl mx-auto">
            <CardHeader>
              <CardTitle>Acceso requerido</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Inicia sesión para ver tus recetas.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container px-4 sm:px-8 md:px-12 max-w-none mx-auto w-full py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mis recetas</h1>
            <p className="text-muted-foreground">Aquí verás tus recetas guardadas como propias.</p>
          </div>
          {statusMsg && (
            <span
              className={`text-sm font-medium ${
                statusMsgType === "error" ? "text-destructive" : "text-green-600"
              }`}
            >
              {statusMsg}
            </span>
          )}
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Cargando tus recetas...
            </CardContent>
          </Card>
        ) : myRecipes.length > 0 ? (
          <div className="grid [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] gap-6">
            {myRecipes.map((recipe) => (
              <MyRecipeCard
                key={recipe.id}
                recipe={recipe}
                onDelete={handleDeleteRecipe}
                onFavoriteToggle={toggleFavorite}
                isFavorite={favorites.includes(recipe.id)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Aún no tienes recetas propias.
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
