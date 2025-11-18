import type React from "react"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Clock, Users, Star } from "lucide-react"
import { API_URL } from "@/lib/api"
import type { Recipe } from "@/lib/recipes"
import { useAuth } from "@/contexts/auth-context"

interface RecipeCardProps {
  recipe: Recipe
  onFavoriteToggle?: (recipeId: string) => void
  isFavorite?: boolean
}

export function RecipeCard({ recipe, onFavoriteToggle, isFavorite = false }: RecipeCardProps) {
  const { user } = useAuth()
  const [favorite, setFavorite] = useState(isFavorite)
  const [avgRating, setAvgRating] = useState<number>(0)
  const [ratingCount, setRatingCount] = useState<number>(0)
  const [myRating, setMyRating] = useState<number | null>(null)

  useEffect(() => {
    setFavorite(isFavorite)
  }, [isFavorite])

  useEffect(() => {
    ;(async () => {
      try {
        // promedio
        const r = await fetch(`${API_URL}/api/recipes/${recipe.id}/ratings`)
        if (r.ok) {
          const data: { average: number; count: number } = await r.json()
          setAvgRating(data.average)
          setRatingCount(data.count)
        }
        // rating del usuario
        if (user) {
          const ur = await fetch(`${API_URL}/api/users/${user.id}/ratings/${recipe.id}`)
          if (ur.ok) {
            const d: { rating: number | null } = await ur.json()
            setMyRating(d.rating)
          }
        }
      } catch {}
    })()
  }, [recipe.id, user])

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) {
      alert("Debes iniciar sesión para guardar favoritos")
      return
    }
    setFavorite(!favorite)
    onFavoriteToggle?.(recipe.id)
  }

  const handleRate = async (e: React.MouseEvent, value: number) => {
    e.preventDefault()
    if (!user) {
      alert("Debes iniciar sesión para valorar")
      return
    }
    try {
      const res = await fetch(`${API_URL}/api/users/${user.id}/ratings/${recipe.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: value }),
      })
      if (!res.ok) return
      setMyRating(value)
      const r = await fetch(`${API_URL}/api/recipes/${recipe.id}/ratings`)
      if (r.ok) {
        const data: { average: number; count: number } = await r.json()
        setAvgRating(data.average)
        setRatingCount(data.count)
      }
    } catch {}
  }

  return (
    <Link to={`/recipe/${recipe.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 h-full">
        <div className="relative h-48 overflow-hidden">
          <img
            src={recipe.imageUrl || "/placeholder.svg"}
            alt={recipe.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-110"
          />
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-2 right-2 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white/90 hover:bg-white shadow-md ${
              favorite ? "text-red-500" : "text-gray-600"
            }`}
            onClick={handleFavoriteClick}
          >
            <Heart className={`h-5 w-5 ${favorite ? "fill-current" : ""}`} />
          </Button>
          {recipe.categoryName && (
            <Badge className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm">{recipe.categoryName}</Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="text-lg sm:text-xl font-bold mb-2 line-clamp-1 text-balance">{recipe.title}</h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 text-pretty">{recipe.description || "Sin descripción"}</p>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {recipe.prepTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{recipe.prepTime}</span>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{recipe.servings}</span>
              </div>
            )}
            <div className="ml-auto flex items-center gap-1">
              {[1,2,3,4,5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className="text-yellow-500 hover:opacity-80"
                  onClick={(e) => handleRate(e, n)}
                  title={user ? `Valorar ${n}` : "Inicia sesión para valorar"}
                >
                  <Star className={`h-4 w-4 ${((myRating ?? 0) >= n) ? 'fill-current' : ''}`} />
                </button>
              ))}
              <span className="ml-2 text-xs text-muted-foreground">{avgRating.toFixed(1)} ({ratingCount})</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={recipe.userAvatar || "/placeholder.svg"} alt={recipe.userName} />
              <AvatarFallback>{recipe.userName[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{recipe.userName}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
