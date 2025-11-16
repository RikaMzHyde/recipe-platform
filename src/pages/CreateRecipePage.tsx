import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import { CreateRecipeForm } from "@/components/create-recipe-form"
import { getUser } from "@/lib/auth"

export default function CreateRecipePage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const user = getUser()

  // Redirigir si no está autenticado
  if (!user) {
    navigate("/")
    return null
  }

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
