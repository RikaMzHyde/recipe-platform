// Interfaz que define un ingrediente de una receta
export interface Ingredient {
  name: string
  amount: string
}

// Interfaz principal que define la estructura completa de una receta
export interface Recipe {
  id: string
  title: string
  description: string | null
  categoryId: number | null
  categoryName: string | null
  imageUrl: string | null
  ingredients: Ingredient[] | null
  prepTime: string | null
  cookTime: string | null
  servings: number | null
  difficulty: "Fácil" | "Media" | "Difícil" | null
  preparation: string | null
  createdAt: string
  userId: string
  userName: string
  userAvatar: string | null
}

// Interfaz que representa una categoría de recetas
export interface Category {
  id: number
  name: string
}

// Importamos la URL base del backend
import { API_URL } from "@/lib/api"

// Obtiene todas las recetas
export async function fetchRecipes(): Promise<Recipe[]> {
  try {
    const response = await fetch(`${API_URL}/api/recipes`)
    if (!response.ok) throw new Error('Error al cargar recetas')
    return await response.json()
  } catch (error) {
    console.error('Error fetching recipes:', error)
    return []
  }
}

// Obtiene todas las categorías
export async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_URL}/api/categories`)
    if (!response.ok) throw new Error('Error al cargar categorías')
    return await response.json()
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

// Crea una receta enviando datos e imagen
export async function createRecipeWithImage(formData: FormData): Promise<Recipe> {
  const response = await fetch(`${API_URL}/api/recipes/with-image`, {
    method: 'POST',
    body: formData,
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al crear la receta')
  }
  
  // Devolvemos la receta creada
  return await response.json()
}

