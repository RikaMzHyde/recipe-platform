"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { RecipeCarousel } from "@/components/recipe-carousel"
import { RecipeCard } from "@/components/recipe-card"
import { RecipeSearch } from "@/components/recipe-search"
import { fetchRecipes, type Recipe } from "@/lib/recipes"

export default function HomePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedFavorites = localStorage.getItem("favorites")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
    
    // Cargar recetas desde el backend
    loadRecipes()
  }, [])

  const loadRecipes = async () => {
    setLoading(true)
    try {
      const data = await fetchRecipes()
      setRecipes(data)
      setAllRecipes(data)
    } catch (error) {
      console.error("Error al cargar recetas:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string, category: string, ingredient: string) => {
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

    setRecipes(filtered)
  }

  const handleFavoriteToggle = (recipeId: string) => {
    const newFavorites = favorites.includes(recipeId)
      ? favorites.filter((id) => id !== recipeId)
      : [...favorites, recipeId]

    setFavorites(newFavorites)
    localStorage.setItem("favorites", JSON.stringify(newFavorites))
  }

  const featuredRecipes = recipes.slice(0, 5)

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
          <RecipeSearch onSearch={handleSearch} />
        </section>

        <section className="px-4 sm:px-8 md:px-12">
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
