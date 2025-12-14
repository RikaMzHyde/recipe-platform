import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"
import type { Category } from "@/lib/recipes"
// Props que recibe este componente
interface RecipeSearchProps {
  onSearch: (query: string, category: string, ingredient: string, difficulty: string) => void
  initialCategory?: string
  categories: Category[]
}

// Componente principal
export function RecipeSearch({ onSearch, initialCategory = "", categories }: RecipeSearchProps) {
  // Estados de los filtros de búsqueda
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState(initialCategory)
  const [ingredient, setIngredient] = useState("")
  const [difficulty, setDifficulty] = useState("")

  // Si se recibe una categoría inicial, se establece en el estado
  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory)
    }
  }, [initialCategory])

  // Ejecuta búsqueda enviando filtros al padre
  const handleSearch = () => {
    onSearch(query, category, ingredient, difficulty)
  }

  // Limpiar filtros y ejecutar búsqueda vacía
  const handleClear = () => {
    setQuery("")
    setCategory("")
    setIngredient("")
    setDifficulty("")
    onSearch("", "", "", "")
  }

  // Saber si hay filtros activos
  const hasFilters = query || category || ingredient || difficulty

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Input de texto principal (buscar por nombre) */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar recetas por nombre..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10 h-12 rounded-full"
          />
        </div>
        
        {/* Input de ingrediente */}
        <Input
          placeholder="Ingrediente..."
          value={ingredient}
          onChange={(e) => setIngredient(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="w-full md:w-48 h-12 rounded-full"
        />

        {/* Select de categoría */}
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-48 !h-12 rounded-full flex items-center px-4">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Select de dificultad */}
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-full md:w-48 !h-12 rounded-full flex items-center px-4">
            <SelectValue placeholder="Dificultad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Fácil">Fácil</SelectItem>
            <SelectItem value="Media">Media</SelectItem>
            <SelectItem value="Difícil">Difícil</SelectItem>
          </SelectContent>
        </Select>
        {/* Botones de búsqueda y limpiar */}
        <Button onClick={handleSearch} size="lg" className="rounded-full h-12 px-8">
          Buscar
        </Button>
        {hasFilters && (
          <Button onClick={handleClear} variant="outline" size="lg" className="rounded-full h-12 px-6 bg-transparent">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  )
}
