import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RecipeCard } from "@/components/recipe-card"
import type { Recipe } from "@/lib/recipes"
import { API_URL } from "@/lib/api"

interface PublicUser {
  id: string
  name: string
  avatarUrl?: string | null
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [user, setUser] = useState<PublicUser | null>(null)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        // Cargar recetas del usuario
        const recRes = await fetch(`${API_URL}/api/users/${id}/recipes`)
        if (!recRes.ok) throw new Error("Error al cargar las recetas del usuario")
        const userRecipes: Recipe[] = await recRes.json()
        setRecipes(userRecipes)

        // Intentar cargar datos públicos del usuario (sin email, por privacidad)
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
          if (userRecipes.length > 0) {
            const first = userRecipes[0]
            setUser({ id, name: first.userName, avatarUrl: first.userAvatar })
          }
        }
      } catch (e) {
        console.error(e)
        setError("No se pudo cargar la información de este usuario")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  const title = user?.name || "Usuario"

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container px-3 sm:px-4 md:px-6 lg:px-10 max-w-none mx-auto w-full py-8 space-y-8">
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

        {!loading && !error && recipes.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Recetas de {title}</h2>
            <div className="grid [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] gap-6">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} hideAuthor />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
