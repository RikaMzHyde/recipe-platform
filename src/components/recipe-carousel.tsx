import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Clock, Users } from "lucide-react"
import type { Recipe } from "@/lib/recipes"

// Props que recibe el carrusel
interface RecipeCarouselProps {
  recipes: Recipe[]
}

// Componente principal
export function RecipeCarousel({ recipes }: RecipeCarouselProps) {
  // Índice de la receta actual mostrada
  const [currentIndex, setCurrentIndex] = useState(0)

  // Resetear el índice cuando cambian las recetas
  useEffect(() => {
    if (currentIndex >= recipes.length) {
      setCurrentIndex(0)
    }
  }, [recipes, currentIndex])

  // Autoplay del carrusel cada 5 segundos, si no hay receta no hacemos nada, sino avanza
  useEffect(() => {
    if (recipes.length === 0) return
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % recipes.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [recipes.length])

  // Ir a receta anterior o siguiente
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + recipes.length) % recipes.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % recipes.length)
  }

  if (recipes.length === 0) {
    return null
  }

  const currentRecipe = recipes[currentIndex]
  
  // Protección adicional por si currentRecipe es undefined
  if (!currentRecipe) {
    return null
  }

  return (
    <div className="relative w-full overflow-hidden rounded-3xl">
      {/* Tarjeta principal */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          {/* Contenedor de la imagen */}
          <div className="relative h-[400px] md:h-[500px]">
            {/*Imagen receta*/}
            <img
              src={currentRecipe.imageUrl || "/placeholder.svg"}
              alt={currentRecipe.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            {/* Texto receta*/}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 text-white">
              {/*Titulo receta */}
              <h2 className="mb-2 text-2xl sm:text-3xl md:text-4xl font-bold text-balance">{currentRecipe.title}</h2>
              {/*Descripción receta */}
              <p className="mb-4 text-base sm:text-lg text-white/90 text-pretty max-w-xl sm:max-w-2xl line-clamp-2">
                {currentRecipe.description && currentRecipe.description.length > 150 
                  ? `${currentRecipe.description.substring(0, 150)}...` 
                  : currentRecipe.description}
              </p>
              {/*Información receta */}
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{currentRecipe.prepTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{currentRecipe.servings} personas</span>
                  {currentRecipe.categoryName && (
                <Link 
                  to={`/?category=${encodeURIComponent(currentRecipe.categoryName)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="mb-0 inline-block rounded-full bg-primary px-3 py-1 text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  {currentRecipe.categoryName}
                </Link>
              )}
                </div>
              </div>
              {/*Botón ver receta */}
              <Link to={`/recipe/${currentRecipe.id}`}>
                <Button size="sm" className="rounded-full sm:size-auto sm:px-6 sm:py-2">
                  Ver Receta
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/*Botones carrusel */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/90 hover:bg-white shadow-lg"
        onClick={goToPrevious}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/90 hover:bg-white shadow-lg"
        onClick={goToNext}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
      {/*Indicadores carrusel */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {recipes.map((_, index) => (
          <button
            key={index}
            className={`h-2 rounded-full transition-all ${index === currentIndex ? "w-8 bg-white" : "w-2 bg-white/50"}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
