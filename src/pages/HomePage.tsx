import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import { RecipeCarousel } from "@/components/recipe-carousel"
import { RecipeCard } from "@/components/recipe-card"
import { RecipeSearch } from "@/components/recipe-search"
import { fetchRecipes, fetchCategories, type Recipe, type Category } from "@/lib/recipes"
import { getUser } from "@/lib/auth"

export default function HomePage() {
  const [searchParams] = useSearchParams()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [initialCategory, setInitialCategory] = useState<string>('')
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    // Leer parámetro de categoría desde la URL
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      setInitialCategory(categoryParam)
      // Hacer scroll a la sección de resultados después de un breve delay
      setTimeout(() => {
        const resultsSection = document.getElementById('results-section')
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 300)
    }
    
    // Cargar recetas y categorías desde el backend
    loadRecipes()
    loadCategories()
    
    // Cargar favoritos del usuario desde el backend
    const user = getUser()
    if (user) {
      ;(async () => {
        try {
          const favRes = await fetch(`/api/users/${user.id}/favorites`)
          if (favRes.ok) {
            const favData: { userId: string; recipeId: string }[] = await favRes.json()
            setFavorites(favData.map((f) => f.recipeId))
          }
        } catch (e) {
          console.error("Error al cargar favoritos:", e)
        }
      })()
    }
  }, [searchParams])

  const loadRecipes = async () => {
    setLoading(true)
    try {
      const data = await fetchRecipes()
      setAllRecipes(data)
      
      // Aplicar filtro de categoría si existe en la URL
      const categoryParam = searchParams.get('category')
      if (categoryParam) {
        const filtered = data.filter((recipe) => recipe.categoryName === categoryParam)
        setRecipes(filtered)
      } else {
        setRecipes(data)
      }
    } catch (error) {
      console.error("Error al cargar recetas:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await fetchCategories()
      setCategories(data)
    } catch (error) {
      console.error("Error al cargar categorías:", error)
    }
  }

  const handleSearch = (query: string, category: string, ingredient: string, difficulty: string) => {
    let filtered = [...allRecipes]

    // Filtrar por query (título o descripción)
    if (query) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(query.toLowerCase()) ||
          recipe.description?.toLowerCase().includes(query.toLowerCase())
      )
    }

    // Filtrar por categoría
    if (category && category !== "all") {
      filtered = filtered.filter((recipe) => recipe.categoryName === category)
    }

    // Filtrar por ingrediente
    if (ingredient) {
      filtered = filtered.filter((recipe) =>
        recipe.ingredients?.some((ing) =>
          ing.name.toLowerCase().includes(ingredient.toLowerCase())
        )
      )
    }

    // Filtrar por dificultad
    if (difficulty && difficulty !== "all") {
      filtered = filtered.filter((recipe) => recipe.difficulty === difficulty)
    }

    setRecipes(filtered)
  }

  const handleFavoriteToggle = async (recipeId: string) => {
    const user = getUser()
    if (!user) {
      alert("Debes iniciar sesión para guardar favoritos")
      return
    }

    try {
      if (favorites.includes(recipeId)) {
        // Eliminar de favoritos
        await fetch(`/api/users/${user.id}/favorites/${recipeId}`, { method: "DELETE" })
        setFavorites((prev) => prev.filter((id) => id !== recipeId))
      } else {
        // Agregar a favoritos
        await fetch(`/api/users/${user.id}/favorites`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeId }),
        })
        setFavorites((prev) => [...prev, recipeId])
      }
    } catch (e) {
      console.error("Error al actualizar favoritos:", e)
    }
  }

  const featuredRecipes = allRecipes.slice(0, 5)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container px-3 sm:px-4 md:px-6 lg:px-10 max-w-none mx-auto w-full py-6 sm:py-8 space-y-8 sm:space-y-12">
        <section className="px-4 sm:px-8 md:px-12">
          <RecipeCarousel recipes={featuredRecipes} />
        </section>

        <section className="px-4 sm:px-8 md:px-12">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-balance">Descubre Recetas Deliciosas</h2>
            <p className="text-muted-foreground text-pretty">
              Busca por nombre, categoría o ingrediente para encontrar tu próxima comida favorita
            </p>
          </div>
          <RecipeSearch onSearch={handleSearch} initialCategory={initialCategory} categories={categories} />
        </section>

        <section id="results-section" className="px-4 sm:px-8 md:px-12">
          <h2 className="text-2xl font-bold mb-6">
            {recipes.length === allRecipes.length ? "Todas las Recetas" : `${recipes.length} Recetas Encontradas`}
          </h2>
          {loading && (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">Cargando recetas...</p>
            </div>
          )}
          {recipes.length > 0 ? (
            <div className="grid [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] gap-6">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onFavoriteToggle={handleFavoriteToggle}
                  isFavorite={favorites.includes(recipe.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                No se encontraron recetas. Intenta con otros términos de búsqueda.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
