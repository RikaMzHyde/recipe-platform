import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"
import type { Category } from "@/lib/recipes"

interface RecipeSearchProps {
  onSearch: (query: string, category: string, ingredient: string, difficulty: string) => void
  initialCategory?: string
  categories: Category[]
}

export function RecipeSearch({ onSearch, initialCategory = "", categories }: RecipeSearchProps) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState(initialCategory)
  const [ingredient, setIngredient] = useState("")
  const [difficulty, setDifficulty] = useState("")

  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory)
    }
  }, [initialCategory])

  const handleSearch = () => {
    onSearch(query, category, ingredient, difficulty)
  }

  const handleClear = () => {
    setQuery("")
    setCategory("")
    setIngredient("")
    setDifficulty("")
    onSearch("", "", "", "")
  }

  const hasFilters = query || category || ingredient || difficulty

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
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
        
        <Input
          placeholder="Ingrediente..."
          value={ingredient}
          onChange={(e) => setIngredient(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="w-full md:w-48 h-12 rounded-full"
        />

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
