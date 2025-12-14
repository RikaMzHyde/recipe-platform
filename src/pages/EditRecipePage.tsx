// Página para editar una receta existente

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import { EditRecipeForm } from "@/components/edit-recipe-form"
import { useAuth } from "@/contexts/auth-context"
import type { Recipe } from "@/lib/recipes"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { API_URL } from "@/lib/api"

export default function EditRecipePage() {
  // Hook para redirigir al usuario entre rutas
  const navigate = useNavigate()
  // ID de la receta a editar
  const { id } = useParams<{ id: string }>()
  // Estado para controlar si se está enviando el formulario
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Estado para almacenar los datos de la receta
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  // Estado para mostrar mensaje de carga
  const [loading, setLoading] = useState(true)
  // Estado para manejar errores
  const [error, setError] = useState<string | null>(null)
  // Toast y auth
  const { toast } = useToast()
  const { user } = useAuth()

  const showError = (message: string) => {
    setError(message)
    toast({
      variant: "destructive",
      description: message,
    })
  }

  // Cargar receta cuando se tenga el ID y el usuario esté autenticado
  useEffect(() => {
    // Si no hay user autenticado, redirigir al inicio
    if (!user) {
      navigate("/")
      return
    }

    // Función para cargar la receta
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
        // Guardar la receta en el estado
        setRecipe(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al cargar la receta"
        showError(message)
      } finally {
        // Quitamos el estado de carga
        setLoading(false)
      }
    }

    loadRecipe()
  }, [id, user, navigate])

  // Acción al completar la edición correctamente
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

  // Formulario de edición
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
