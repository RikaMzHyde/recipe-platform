import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import { EditRecipeForm } from "@/components/edit-recipe-form"
import { getUser } from "@/lib/auth"
import type { Recipe } from "@/lib/recipes"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { API_URL } from "@/lib/api"

export default function EditRecipePage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const [user] = useState(() => getUser())

  const showError = (message: string) => {
    setError(message)
    toast({
      variant: "destructive",
      description: message,
    })
  }

  useEffect(() => {
    if (!user) {
      navigate("/")
      return
    }

    const loadRecipe = async () => {
      try {
        const response = await fetch(`${API_URL}/api/recipes/${id}`)
        if (!response.ok) throw new Error("Error al cargar la receta")
        const data: Recipe = await response.json()
        
        // Verificar que el usuario es el propietario
        if (data.userId !== user.id) {
          showError("No tienes permiso para editar esta receta")
          return
        }
        
        setRecipe(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al cargar la receta"
        showError(message)
      } finally {
        setLoading(false)
      }
    }

    loadRecipe()
  }, [id, user, navigate])

  const handleSuccess = () => {
    navigate(`/recipe/${id}`)
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-8 text-center">
              Cargando receta...
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-8 text-center text-destructive">
              {error || "Receta no encontrada"}
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Editar Receta</h1>
          <p className="text-muted-foreground">
            Modifica los detalles de tu receta
          </p>
        </div>

        <EditRecipeForm 
          recipe={recipe}
          userId={user.id}
          onSuccess={handleSuccess}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
        />
      </main>
    </div>
  )
}
