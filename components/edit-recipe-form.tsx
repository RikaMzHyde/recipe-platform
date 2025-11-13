"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, X, ImageIcon } from "lucide-react"
import { fetchCategories, type Category, type Ingredient, type Recipe } from "@/lib/recipes"

interface EditRecipeFormProps {
  recipe: Recipe
  userId: string
  onSuccess: () => void
  isSubmitting: boolean
  setIsSubmitting: (value: boolean) => void
}

export function EditRecipeForm({ recipe, userId, onSuccess, isSubmitting, setIsSubmitting }: EditRecipeFormProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(recipe.imageUrl)
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe.ingredients && recipe.ingredients.length > 0 ? recipe.ingredients : [{ name: "", amount: "" }]
  )
  const [error, setError] = useState<string | null>(null)

  // Form fields inicializados con los datos de la receta
  const [title, setTitle] = useState(recipe.title)
  const [description, setDescription] = useState(recipe.description || "")
  const [categoryId, setCategoryId] = useState<string>(recipe.categoryId?.toString() || "")
  const [prepTime, setPrepTime] = useState(recipe.prepTime || "")
  const [cookTime, setCookTime] = useState(recipe.cookTime || "")
  const [servings, setServings] = useState(recipe.servings?.toString() || "")
  const [difficulty, setDifficulty] = useState<string>(recipe.difficulty || "")

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    const cats = await fetchCategories()
    setCategories(cats)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen no puede superar los 5MB")
        return
      }

      // Validar tipo
      if (!file.type.startsWith("image/")) {
        setError("Solo se permiten archivos de imagen")
        return
      }

      setImageFile(file)
      setError(null)

      // Crear preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: "" }])
  }

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index))
    }
  }

  const updateIngredient = (index: number, field: "name" | "amount", value: string) => {
    const newIngredients = [...ingredients]
    newIngredients[index][field] = value
    setIngredients(newIngredients)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Validar campos requeridos
      if (!title.trim()) {
        throw new Error("El título es obligatorio")
      }
      if (!categoryId) {
        throw new Error("La categoría es obligatoria")
      }
      if (!difficulty) {
        throw new Error("La dificultad es obligatoria")
      }

      let imageUrl = recipe.imageUrl

      // Si hay una nueva imagen, subirla primero
      if (imageFile) {
        const uploadFormData = new FormData()
        uploadFormData.append("image", imageFile)

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        })

        if (!uploadResponse.ok) throw new Error("Error al subir la imagen")
        const uploadData = await uploadResponse.json()
        imageUrl = uploadData.url
      }

      // Preparar datos para actualizar
      const updateData = {
        title: title.trim(),
        description: description.trim() || null,
        categoryId: categoryId ? Number(categoryId) : null,
        imageUrl: imageUrl || null,
        prepTime: prepTime.trim() || null,
        cookTime: cookTime.trim() || null,
        servings: servings ? Number(servings) : null,
        difficulty: difficulty || null,
        ingredients: ingredients.filter((ing) => ing.name.trim() && ing.amount.trim()),
      }

      // Actualizar receta
      const response = await fetch(`/api/recipes/${recipe.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al actualizar la receta")
      }

      // Éxito
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar la receta")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar información de la receta</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
              {error}
            </div>
          )}

      {/* Título */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Título <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Paella Valenciana"
        />
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="description">Descripción</Label>
          <span className={`text-xs ${description.length > 500 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {description.length}/500
          </span>
        </div>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => {
            if (e.target.value.length <= 500) {
              setDescription(e.target.value)
            }
          }}
          placeholder="Describe tu receta..."
          rows={4}
          maxLength={500}
        />
      </div>

      {/* Categoría y Dificultad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">
            Categoría <span className="text-destructive">*</span>
          </Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar categoría..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">
            Dificultad <span className="text-destructive">*</span>
          </Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar dificultad..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Fácil">Fácil</SelectItem>
              <SelectItem value="Media">Media</SelectItem>
              <SelectItem value="Difícil">Difícil</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Ingredientes */}
      <div className="space-y-2">
        <Label>Ingredientes</Label>
        <div className="space-y-2">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Nombre (ej: Arroz)"
                value={ingredient.name}
                onChange={(e) => updateIngredient(index, "name", e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Cantidad (ej: 400g)"
                value={ingredient.amount}
                onChange={(e) => updateIngredient(index, "amount", e.target.value)}
                className="w-32"
              />
              {ingredients.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeIngredient(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addIngredient} className="mt-2">
          <Plus className="h-4 w-4 mr-2" />
          Agregar ingrediente
        </Button>
      </div>

      {/* Tiempos y Porciones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="prepTime">Tiempo de preparación</Label>
          <Input
            id="prepTime"
            value={prepTime}
            onChange={(e) => setPrepTime(e.target.value)}
            placeholder="Ej: 30 min"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cookTime">Tiempo de cocción</Label>
          <Input
            id="cookTime"
            value={cookTime}
            onChange={(e) => setCookTime(e.target.value)}
            placeholder="Ej: 1 hora"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="servings">Porciones</Label>
          <Input
            id="servings"
            type="number"
            min="1"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            placeholder="Ej: 4"
          />
        </div>
      </div>

      {/* Imagen */}
      <div className="space-y-2">
        <Label htmlFor="image">Imagen de la receta</Label>
        <div className="flex flex-col gap-4">
          {previewUrl && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex items-center gap-4">
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("image")?.click()}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Cambiar imagen
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Tamaño máximo: 5MB. Formatos: JPG, PNG, GIF, WebP
          </p>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "Guardando..." : "Guardar cambios"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
