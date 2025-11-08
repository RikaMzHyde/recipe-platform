"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, X, Upload, ImageIcon } from "lucide-react"
import { createRecipeWithImage, fetchCategories, type Category, type Ingredient } from "@/lib/recipes"

interface CreateRecipeFormProps {
  userId: string
  onSuccess: () => void
  isSubmitting: boolean
  setIsSubmitting: (value: boolean) => void
}

export function CreateRecipeForm({ userId, onSuccess, isSubmitting, setIsSubmitting }: CreateRecipeFormProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: "", amount: "" }])
  const [error, setError] = useState<string | null>(null)

  // Form fields
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [prepTime, setPrepTime] = useState("")
  const [cookTime, setCookTime] = useState("")
  const [servings, setServings] = useState("")
  const [difficulty, setDifficulty] = useState<string>("")

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

      const formData = new FormData()

      // Agregar userId (obligatorio)
      formData.append("userId", userId)

      // Agregar campos básicos
      formData.append("title", title.trim())
      if (description.trim()) formData.append("description", description.trim())
      if (categoryId) formData.append("categoryId", categoryId)
      if (prepTime.trim()) formData.append("prepTime", prepTime.trim())
      if (cookTime.trim()) formData.append("cookTime", cookTime.trim())
      if (servings) formData.append("servings", servings)
      if (difficulty) formData.append("difficulty", difficulty)

      // Agregar ingredientes (solo los que tengan nombre y cantidad)
      const validIngredients = ingredients.filter((ing) => ing.name.trim() && ing.amount.trim())
      if (validIngredients.length > 0) {
        formData.append("ingredients", JSON.stringify(validIngredients))
      }

      // Agregar imagen si existe
      if (imageFile) {
        formData.append("image", imageFile)
      }

      // Enviar al backend
      await createRecipeWithImage(formData)

      // Éxito
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la receta")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
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
          required
        />
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe tu receta..."
          rows={4}
        />
      </div>

      {/* Categoría y Dificultad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Categoría</Label>
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
          <Label htmlFor="difficulty">Dificultad</Label>
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
            placeholder="Ej: 45 min"
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
        <Label htmlFor="image">Imagen</Label>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("image")?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              {imageFile ? "Cambiar imagen" : "Seleccionar imagen"}
            </Button>
            {imageFile && (
              <span className="text-sm text-muted-foreground">{imageFile.name}</span>
            )}
          </div>

          {previewUrl && (
            <Card>
              <CardContent className="p-4">
                <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="object-cover w-full h-full"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {!previewUrl && (
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mb-2" />
                  <p className="text-sm">Vista previa de la imagen</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Tamaño máximo: 5MB. Formatos: JPG, PNG, GIF, WebP
        </p>
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "Creando..." : "Crear Receta"}
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
  )
}
