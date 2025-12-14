// Página para crear una nueva receta

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import { CreateRecipeForm } from "@/components/create-recipe-form"
import { useAuth } from "@/contexts/auth-context"

export default function CreateRecipePage() {
  // Hook para redirigir al usuario entre rutas
  const navigate = useNavigate()
  // Estado para controlar si se está enviando el formulario
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Contexto de autenticación para obtener el usuario actual
  const { user } = useAuth()

  // Redirigir si no está autenticado
  if (!user) {
    navigate("/")
    return null
  }

  // Cuando se crea la receta correctamente, se redirige al inicio
  const handleSuccess = () => {
    navigate("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Crear Nueva Receta</h1>
          <p className="text-muted-foreground">
            Comparte tu receta favorita con la comunidad
          </p>
        </div>

        {/* Formulario para crear una receta */}
        <CreateRecipeForm 
          userId={user.id}
          onSuccess={handleSuccess}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
        />
      </main>
    </div>
  )
}
