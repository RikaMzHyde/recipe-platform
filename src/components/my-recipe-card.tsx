import type React from "react"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Clock, Users, Pencil, Trash2 } from "lucide-react"
import type { Recipe } from "@/lib/recipes"
import { API_URL } from "@/lib/api"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface MyRecipeCardProps {
  recipe: Recipe
  onDelete: (recipeId: string) => void
  onFavoriteToggle?: (recipeId: string) => void
  isFavorite?: boolean
}

export function MyRecipeCard({ recipe, onDelete, onFavoriteToggle, isFavorite = false }: MyRecipeCardProps) {
  const navigate = useNavigate()
  const [favorite, setFavorite] = useState(isFavorite)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setFavorite(isFavorite)
  }, [isFavorite])

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFavorite(!favorite)
    onFavoriteToggle?.(recipe.id)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(`/recipe/${recipe.id}/edit`)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`${API_URL}/api/recipes/${recipe.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        onDelete(recipe.id)
        setShowDeleteDialog(false)
      } else {
        alert("Error al eliminar la receta")
      }
    } catch (error) {
      console.error(error)
      alert("Error al eliminar la receta")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Link to={`/recipe/${recipe.id}`}>
        <Card className="group overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 h-full">
          <div className="relative h-48 overflow-hidden">
            <img
              src={recipe.imageUrl || "/placeholder.svg"}
              alt={recipe.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-110"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 rounded-full bg-white/90 hover:bg-white shadow-md ${
                  favorite ? "text-red-500" : "text-gray-600"
                }`}
                onClick={handleFavoriteClick}
              >
                <Heart className={`h-5 w-5 ${favorite ? "fill-current" : ""}`} />
              </Button>
            </div>
            {recipe.categoryName && (
              <Badge className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm">{recipe.categoryName}</Badge>
            )}
          </div>
          <CardContent className="p-4">
            <h3 className="text-lg sm:text-xl font-bold mb-2 line-clamp-1 text-balance">{recipe.title}</h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2 text-pretty">
              {recipe.description || "Sin descripción"}
            </p>
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
              {recipe.difficulty && (
                <Badge variant="outline" className="ml-auto">
                  {recipe.difficulty}
                </Badge>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleEdit}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-destructive hover:text-destructive"
              onClick={handleDeleteClick}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Borrar
            </Button>
          </CardFooter>
        </Card>
      </Link>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la receta "{recipe.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
