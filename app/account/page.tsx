"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getUser, setUser, type User } from "@/lib/auth"
import type { Recipe } from "@/lib/recipes"
import { RecipeCard } from "@/components/recipe-card"

export default function AccountPage() {
  const [user, setUserState] = useState<User | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [myRecipesIds, setMyRecipesIds] = useState<string[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([])
  const [statusMsg, setStatusMsg] = useState<string>("")
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [prepTime, setPrepTime] = useState("")
  const [cookTime, setCookTime] = useState("")
  const [servings, setServings] = useState<number | undefined>(undefined)
  const [difficulty, setDifficulty] = useState("")

  useEffect(() => {
    const u = getUser()
    setUserState(u)
    if (u) {
      setName(u.name)
      setEmail(u.email)
    }
    ;(async () => {
      try {
        // Cargar recetas disponibles
        const recRes = await fetch(`/api/recipes`)
        if (!recRes.ok) throw new Error("Error al cargar recetas")
        const recData: Recipe[] = await recRes.json()
        setAllRecipes(recData)

        if (u) {
          // Mis recetas (IDs)
          const mineRes = await fetch(`/api/users/${u.id}/my-recipes`)
          if (!mineRes.ok) throw new Error("Error al cargar mis recetas")
          const mineData: { userId: string; recipeId: string }[] = await mineRes.json()
          setMyRecipesIds(mineData.map((m) => m.recipeId))

          // Favoritos (para pintar corazones)
          const favRes = await fetch(`/api/users/${u.id}/favorites`)
          if (!favRes.ok) throw new Error("Error al cargar favoritos")
          const favData: { userId: string; recipeId: string }[] = await favRes.json()
          setFavorites(favData.map((f) => f.recipeId))
        }
      } catch (e) {
        console.error(e)
      }
    })()
  }, [])

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container px-3 sm:px-4 md:px-6 lg:px-10 max-w-none mx-auto w-full py-8">
          <Card className="max-w-xl mx-auto">
            <CardHeader>
              <CardTitle>Acceso requerido</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Inicia sesión para gestionar tu cuenta y ver tus favoritos.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const handleSaveProfile = () => {
    if (!name || !email) {
      setStatusMsg("Por favor, completa nombre y email")
      return
    }
    const updated: User = { ...user, name, email }
    setUser(updated)
    setUserState(updated)
    setStatusMsg("Datos guardados correctamente")
    setTimeout(() => setStatusMsg(""), 2000)
  }

  const handleChangePassword = () => {
    if (newPassword.length < 6) {
      setStatusMsg("La nueva contraseña debe tener al menos 6 caracteres")
      return
    }
    if (newPassword !== confirmPassword) {
      setStatusMsg("Las contraseñas no coinciden")
      return
    }
    // Simulación: guardamos en localStorage una contraseña asociada al usuario
    const passKey = `pass:${user.id}`
    const stored = localStorage.getItem(passKey)
    if (stored && currentPassword !== stored) {
      setStatusMsg("La contraseña actual no es correcta")
      return
    }
    localStorage.setItem(passKey, newPassword)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setStatusMsg("Contraseña actualizada")
    setTimeout(() => setStatusMsg(""), 2000)
  }

  const myRecipes = allRecipes.filter((r) => myRecipesIds.includes(r.id))

  const toggleFavorite = async (recipeId: string) => {
    if (!user) return
    try {
      if (favorites.includes(recipeId)) {
        await fetch(`/api/users/${user.id}/favorites/${recipeId}`, { method: "DELETE" })
        setFavorites((prev) => prev.filter((id) => id !== recipeId))
      } else {
        await fetch(`/api/users/${user.id}/favorites`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeId }),
        })
        setFavorites((prev) => [...prev, recipeId])
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreateRecipe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!title.trim()) return
    setCreating(true)
    try {
      const res = await fetch(`/api/recipes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          category: category || undefined,
          imageUrl: imageUrl || undefined,
          author: user.name,
          authorAvatar: undefined,
          prepTime: prepTime || undefined,
          cookTime: cookTime || undefined,
          servings: servings ?? undefined,
          difficulty: difficulty || undefined,
          userId: user.id,
        }),
      })
      if (!res.ok) throw new Error("No se pudo crear la receta")
      const newRecipe: Recipe = await res.json()
      setAllRecipes((prev) => [newRecipe, ...prev])
      await fetch(`/api/users/${user.id}/my-recipes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId: newRecipe.id }),
      })
      setMyRecipesIds((prev) => Array.from(new Set([newRecipe.id, ...prev])))
      setTitle("")
      setDescription("")
      setCategory("")
      setImageUrl("")
      setPrepTime("")
      setCookTime("")
      setServings(undefined)
      setDifficulty("")
      setStatusMsg("Receta creada")
      setTimeout(() => setStatusMsg(""), 2000)
    } catch (err) {
      console.error(err)
      setStatusMsg("Error al crear la receta")
      setTimeout(() => setStatusMsg(""), 2000)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container px-4 sm:px-8 md:px-12 max-w-none mx-auto w-full py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Mi cuenta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSaveProfile} className="rounded-full">Guardar cambios</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cambiar contraseña</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="current">Contraseña actual</Label>
                <Input id="current" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="new">Nueva contraseña</Label>
                <Input id="new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="confirm">Confirmar nueva contraseña</Label>
                <Input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={handleChangePassword} className="rounded-full">Actualizar contraseña</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nueva receta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateRecipe} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="category">Categoría</Label>
                <select
                  id="category"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">-- Selecciona --</option>
                  <option value="Italiana">Italiana</option>
                  <option value="Española">Española</option>
                  <option value="Mexicana">Mexicana</option>
                  <option value="Japonesa">Japonesa</option>
                  <option value="China">China</option>
                  <option value="Vietnamita">Vietnamita</option>
                  <option value="Coreana">Coreana</option>
                  <option value="Hindú">Hindú</option>
                  <option value="Americana">Americana</option>
                  <option value="Griega">Griega</option>
                  <option value="Vegana">Vegana</option>
                  <option value="Hawaiana">Hawaiana</option>
                  <option value="Latina">Latina</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Descripción</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="imageUrl">Imagen (URL)</Label>
                <Input id="imageUrl" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="prepTime">Tiempo de preparación</Label>
                <Input id="prepTime" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="cookTime">Tiempo de cocción</Label>
                <Input id="cookTime" value={cookTime} onChange={(e) => setCookTime(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="servings">Raciones</Label>
                <Input id="servings" type="number" min={1} value={servings ?? ""} onChange={(e) => setServings(e.target.value ? Number(e.target.value) : undefined)} />
              </div>
              <div>
                <Label htmlFor="difficulty">Dificultad</Label>
                <select
                  id="difficulty"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="">-- Selecciona --</option>
                  <option value="facil">Fácil</option>
                  <option value="media">Media</option>
                  <option value="dificil">Difícil</option>
                </select>
              </div>
              <div className="md:col-span-2 flex items-center gap-3">
                <Button type="submit" disabled={creating}>Crear receta</Button>
                {statusMsg && <span className="text-sm text-muted-foreground">{statusMsg}</span>}
              </div>
            </form>
          </CardContent>
        </Card>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Mis recetas</h2>
              <p className="text-muted-foreground">Aquí verás tus recetas guardadas como propias.</p>
            </div>
          </div>
          {myRecipes.length > 0 ? (
            <div className="grid [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] gap-6">
              {myRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onFavoriteToggle={toggleFavorite}
                  isFavorite={favorites.includes(recipe.id)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Aún no tienes recetas propias.
              </CardContent>
            </Card>
          )}
        </section>

        {statusMsg && (
          <div className="text-sm text-center text-primary">{statusMsg}</div>
        )}
      </main>
    </div>
  )
}
