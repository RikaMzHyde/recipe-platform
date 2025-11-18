import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Heart, Clock, Users, ChefHat, Flame, Star, Pencil } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { type Recipe } from "@/lib/recipes"
import { API_URL } from "@/lib/api"

export default function RecipeDetailPage() {
  const params = useParams()
  const navigate = useNavigate()
  const recipeId = params.id as string
  
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const [isFavorite, setIsFavorite] = useState(false)
  const [comments, setComments] = useState<Array<{ id: string; content: string; createdAt: string; userId: string; userName: string; userAvatar: string | null }>>([])
  const [commentText, setCommentText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [avgRating, setAvgRating] = useState<number>(0)
  const [ratingCount, setRatingCount] = useState<number>(0)
  const [myRating, setMyRating] = useState<number | null>(null)

  useEffect(() => {
    // Cargar receta y datos relacionados
    ;(async () => {
      try {
        setLoading(true)
        
        // Cargar receta
        const recipeRes = await fetch(`${API_URL}/api/recipes/${recipeId}`)
        if (!recipeRes.ok) {
          setRecipe(null)
          setLoading(false)
          return
        }
        const recipeData = await recipeRes.json()
        setRecipe(recipeData)
        
        // cargar comentarios
        const res = await fetch(`${API_URL}/api/recipes/${recipeId}/comments`)
        if (res.ok) {
          const data = await res.json()
          setComments(data)
        }
        // cargar rating promedio
        const rr = await fetch(`${API_URL}/api/recipes/${recipeId}/ratings`)
        if (rr.ok) {
          const d: { average: number; count: number } = await rr.json()
          setAvgRating(d.average)
          setRatingCount(d.count)
        }
        // cargar rating del usuario y favoritos
        if (user) {
          const ur = await fetch(`${API_URL}/api/users/${user.id}/ratings/${recipeId}`)
          if (ur.ok) {
            const x: { rating: number | null } = await ur.json()
            setMyRating(x.rating)
          }
          // Cargar favoritos del usuario
          const favRes = await fetch(`${API_URL}/api/users/${user.id}/favorites`)
          if (favRes.ok) {
            const favData: { userId: string; recipeId: string }[] = await favRes.json()
            const favoriteIds = favData.map((f) => f.recipeId)
            setIsFavorite(favoriteIds.includes(recipeId))
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [recipeId, user])

  const handleFavoriteToggle = async () => {
    if (!user) {
      alert("Debes iniciar sesión para guardar favoritos")
      return
    }

    try {
      if (isFavorite) {
        // Eliminar de favoritos
        await fetch(`${API_URL}/api/users/${user.id}/favorites/${recipeId}`, { method: "DELETE" })
        setIsFavorite(false)
      } else {
        // Agregar a favoritos
        await fetch(`${API_URL}/api/users/${user.id}/favorites`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeId }),
        })
        setIsFavorite(true)
      }
    } catch (e) {
      console.error("Error al actualizar favoritos:", e)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      alert("Debes iniciar sesión para comentar")
      return
    }
    const content = commentText.trim()
    if (!content) return
    setSubmitting(true)
    try {
      const res = await fetch(`${API_URL}/api/recipes/${recipeId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, userId: user.id }),
      })
      if (!res.ok) return
      const created = await res.json()
      // Agregar nombre de usuario al comentario creado
      setComments((prev) => [{ ...created, userName: user.name, userAvatar: null }, ...prev])
      setCommentText("")
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRate = async (value: number) => {
    if (!user) {
      alert("Debes iniciar sesión para valorar")
      return
    }
    try {
      const res = await fetch(`${API_URL}/api/users/${user.id}/ratings/${recipeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: value }),
      })
      if (!res.ok) return
      setMyRating(value)
      const r = await fetch(`${API_URL}/api/recipes/${recipeId}/ratings`)
      if (r.ok) {
        const d: { average: number; count: number } = await r.json()
        setAvgRating(d.average)
        setRatingCount(d.count)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const formatCommentDate = (iso: string) => {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ""
    return d.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-12">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Cargando receta...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Receta no encontrada</h1>
            <Button onClick={() => navigate("/")}>Volver al inicio</Button>
          </div>
        </main>
      </div>
    )
  }

  const difficultyColors = {
    Fácil: "bg-green-500/10 text-green-700 dark:text-green-400",
    Media: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    Difícil: "bg-red-500/10 text-red-700 dark:text-red-400",
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container px-3 sm:px-4 md:px-6 max-w-screen-xl mx-auto w-full py-6 sm:py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 sm:mb-6 rounded-full">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="relative h-[400px] lg:h-[600px] rounded-3xl overflow-hidden">
            <img src={recipe.imageUrl || "/placeholder.svg"} alt={recipe.title} className="absolute inset-0 h-full w-full object-cover" />
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="space-y-2">
                  <div>
                    {recipe.categoryName && <Badge className="mb-2">{recipe.categoryName}</Badge>}
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-balance">{recipe.title}</h1>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          className="text-yellow-500 hover:opacity-80"
                          onClick={() => handleRate(n)}
                          title={user ? `Valorar ${n}` : "Inicia sesión para valorar"}
                        >
                          <Star className={`h-5 w-5 ${((myRating ?? 0) >= n) ? 'fill-current' : ''}`} />
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className={`h-4 w-4 ${avgRating > 0 ? 'fill-current text-yellow-500' : 'text-muted-foreground'}`} />
                      <span className="text-foreground font-medium">{avgRating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">({ratingCount} valoraciones)</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full ${isFavorite ? "text-red-500" : "text-gray-600"}`}
                  onClick={handleFavoriteToggle}
                >
                  <Heart className={`h-6 w-6 ${isFavorite ? "fill-current" : ""}`} />
                </Button>
              </div>
              <p className="text-base sm:text-lg text-muted-foreground text-pretty">{recipe.description}</p>
              {user && recipe.userId === user.id && (
                <div className="mt-4">
                  <Button
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs sm:text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition"
                    onClick={() => navigate(`/recipe/${recipeId}/edit`)}
                  >
                    <Pencil className="h-4 w-4" />
                    Editar receta
                  </Button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate(`/user/${recipe.userId}`)}
              className="flex items-center gap-3 text-left hover:underline hover:underline-offset-4"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={recipe.userAvatar || "/placeholder.svg"} alt={recipe.userName} />
                <AvatarFallback>{recipe.userName?.charAt(0) || "?"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Receta de {recipe.userName}</p>
              </div>
            </button>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Preparación</p>
                    <p className="font-semibold">{recipe.prepTime}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/50">
                    <Flame className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cocción</p>
                    <p className="font-semibold">{recipe.cookTime}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                    <Users className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Raciones</p>
                    <p className="font-semibold">{recipe.servings} personas</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <ChefHat className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dificultad</p>
                    {recipe.difficulty && (
                      <Badge className={difficultyColors[recipe.difficulty]} variant="secondary">
                        {recipe.difficulty}
                      </Badge>
                    )}
                    {!recipe.difficulty && <span className="text-sm">No especificada</span>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                  1
                </span>
                Ingredientes
              </h2>
              {recipe.ingredients && recipe.ingredients.length > 0 ? (
                <ul className="space-y-3">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      <span className="text-pretty">
                        <strong>{ingredient.name}:</strong> {ingredient.amount}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No se especificaron ingredientes</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                  2
                </span>
                Resumen de preparación
              </h2>
              {recipe.preparation && recipe.preparation.trim().length > 0 ? (
                <p className="text-pretty text-muted-foreground whitespace-pre-line">{recipe.preparation}</p>
              ) : (
                <p className="text-muted-foreground">No hay resumen de preparación disponible</p>
              )}
            </CardContent>
          </Card>

        </div>

        <div className="grid grid-cols-1 gap-8 mt-8">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">Comentarios</h2>
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((c) => (
                    <div key={c.id} className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        {c.userAvatar ? (
                          <AvatarImage src={c.userAvatar} alt={c.userName} />
                        ) : (
                          <AvatarFallback>{c.userName?.charAt(0) || "?"}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/user/${c.userId}`)}
                            className="font-medium leading-none hover:underline hover:underline-offset-4"
                          >
                            {c.userName}
                          </button>
                          {c.createdAt && (
                            <span className="text-xs text-muted-foreground">
                              {formatCommentDate(c.createdAt)}
                            </span>
                          )}
                        </div>
                        <div className="text-muted-foreground">{c.content}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Sé la primera persona en comentar esta receta.</p>
              )}

              {user && (
                <form onSubmit={handleSubmitComment} className="mt-2 flex items-start gap-2">
                  <textarea
                    className="flex-1 resize-none h-10 min-h-10 max-h-32 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Añade un comentario"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <Button type="submit" disabled={submitting || commentText.trim().length === 0}>Comentar</Button>
                </form>
              )}
              {!user && (
                <p className="text-sm text-muted-foreground">Debes iniciar sesión para comentar</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
