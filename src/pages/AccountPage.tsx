import { useEffect, useState, useRef, useCallback, type ChangeEvent } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUser, setUser, type User } from "@/lib/auth"
import type { Recipe } from "@/lib/recipes"
import Cropper, { type Area } from "react-easy-crop"
import { API_URL } from "@/lib/api"

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
  const [statusMsgType, setStatusMsgType] = useState<"success" | "error">("error")
  const [passwordMsg, setPasswordMsg] = useState<string>("")
  const [passwordMsgType, setPasswordMsgType] = useState<"success" | "error">("error")
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [prepTime, setPrepTime] = useState("")
  const [cookTime, setCookTime] = useState("")
  const [servings, setServings] = useState<number | undefined>(undefined)
  const [difficulty, setDifficulty] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null)
  const [isCropOpen, setIsCropOpen] = useState(false)

  useEffect(() => {
    const u = getUser()
    setUserState(u)
    if (u) {
      setName(u.name)
      setEmail(u.email)
      setAvatarUrl(u.avatarUrl || "")
    }
    ;(async () => {
      try {
        // Cargar recetas disponibles
        const recRes = await fetch(`${API_URL}/recipes`)
        if (!recRes.ok) throw new Error("Error al cargar recetas")
        const recData: Recipe[] = await recRes.json()
        setAllRecipes(recData)

        if (u) {
          // Mis recetas
          const mineRes = await fetch(`${API_URL}/users/${u.id}/recipes`)
          if (!mineRes.ok) throw new Error("Error al cargar mis recetas")
          const mineData: Recipe[] = await mineRes.json()
          setMyRecipesIds(mineData.map((m) => m.id))

          // Favoritos (para pintar corazones)
          const favRes = await fetch(`${API_URL}/users/${u.id}/favorites`)
          if (!favRes.ok) throw new Error("Error al cargar favoritos")
          const favData: { userId: string; recipeId: string }[] = await favRes.json()
          setFavorites(favData.map((f) => f.recipeId))
        }
      } catch (e) {
        console.error(e)
      }
    })()
  }, [])

  const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
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

  const handleSaveProfile = async () => {
    if (!name || !name.trim()) {
      setStatusMsg("Por favor, completa el nombre")
      setStatusMsgType("error")
      setTimeout(() => setStatusMsg(""), 3000)
      return
    }
    
    try {
      const res = await fetch(`${API_URL}/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      })
      
      if (!res.ok) {
        const error = await res.json()
        setStatusMsg(error.error || "Error al guardar los cambios")
        setStatusMsgType("error")
        setTimeout(() => setStatusMsg(""), 3000)
        return
      }
      
      const updatedUser = await res.json()
      const updated: User = { ...user, name: updatedUser.name, avatarUrl: updatedUser.avatarUrl }
      setUser(updated)
      setUserState(updated)
      setAvatarUrl(updated.avatarUrl || "")
      setStatusMsg("Datos guardados correctamente")
      setStatusMsgType("success")
      setTimeout(() => setStatusMsg(""), 2000)
    } catch (e) {
      setStatusMsg("Error al conectar con el servidor")
      setStatusMsgType("error")
      setTimeout(() => setStatusMsg(""), 3000)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword) {
      setPasswordMsg("Por favor, ingresa tu contraseña actual")
      setPasswordMsgType("error")
      setTimeout(() => setPasswordMsg(""), 3000)
      return
    }
    if (newPassword.length < 6) {
      setPasswordMsg("La nueva contraseña debe tener al menos 6 caracteres")
      setPasswordMsgType("error")
      setTimeout(() => setPasswordMsg(""), 3000)
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg("Las contraseñas no coinciden")
      setPasswordMsgType("error")
      setTimeout(() => setPasswordMsg(""), 3000)
      return
    }

    try {
      const res = await fetch(`${API_URL}/users/${user.id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        setPasswordMsg(error.error || "Error al cambiar la contraseña")
        setPasswordMsgType("error")
        setTimeout(() => setPasswordMsg(""), 3000)
        return
      }

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setPasswordMsg("Contraseña actualizada correctamente")
      setPasswordMsgType("success")
      setTimeout(() => setPasswordMsg(""), 3000)
    } catch (e) {
      setPasswordMsg("Error al conectar con el servidor")
      setPasswordMsgType("error")
      setTimeout(() => setPasswordMsg(""), 3000)
    }
  }

  const myRecipes = allRecipes.filter((r) => myRecipesIds.includes(r.id))

  const toggleFavorite = async (recipeId: string) => {
    if (!user) return
    try {
      if (favorites.includes(recipeId)) {
        await fetch(`${API_URL}/users/${user.id}/favorites/${recipeId}`, { method: "DELETE" })
        setFavorites((prev) => prev.filter((id) => id !== recipeId))
      } else {
        await fetch(`${API_URL}/users/${user.id}/favorites`, {
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

  const handleDeleteRecipe = (recipeId: string) => {
    // Eliminar de la lista de todas las recetas
    setAllRecipes((prev) => prev.filter((r) => r.id !== recipeId))
    // Eliminar de mis recetas
    setMyRecipesIds((prev) => prev.filter((id) => id !== recipeId))
    // Eliminar de favoritos si estaba
    setFavorites((prev) => prev.filter((id) => id !== recipeId))
    setStatusMsg("Receta eliminada correctamente")
    setStatusMsgType("success")
    setTimeout(() => setStatusMsg(""), 2000)
  }

  const handleCreateRecipe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!title.trim()) return
    setCreating(true)
    try {
      const res = await fetch(`${API_URL}/recipes`, {
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
      await fetch(`${API_URL}/users/${user.id}/my-recipes`, {
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
      setStatusMsgType("success")
      setTimeout(() => setStatusMsg(""), 2000)
    } catch (err) {
      console.error(err)
      setStatusMsg("Error al crear la receta")
      setStatusMsgType("error")
      setTimeout(() => setStatusMsg(""), 2000)
    } finally {
      setCreating(false)
    }
  }

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (file.size > 5 * 1024 * 1024) {
      setStatusMsg("La imagen no puede superar los 5MB")
      setStatusMsgType("error")
      setTimeout(() => setStatusMsg(""), 3000)
      e.target.value = ""
      return
    }

    if (!file.type.startsWith("image/")) {
      setStatusMsg("Solo se permiten archivos de imagen")
      setStatusMsgType("error")
      setTimeout(() => setStatusMsg(""), 3000)
      e.target.value = ""
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setCropImageUrl(objectUrl)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    setIsCropOpen(true)
  }

  const getCroppedImageBlob = async (imageSrc: string, cropPixels: Area): Promise<Blob> => {
    const createImage = (url: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener("load", () => resolve(image))
        image.addEventListener("error", (error) => reject(error))
        image.setAttribute("crossOrigin", "anonymous")
        image.src = url
      })
    }

    const image = await createImage(imageSrc)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      throw new Error("No se pudo crear el lienzo para recortar la imagen")
    }

    const { width, height, x, y } = cropPixels
    canvas.width = width
    canvas.height = height

    ctx.drawImage(image, x, y, width, height, 0, 0, width, height)

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("No se pudo generar la imagen recortada"))
          return
        }
        resolve(blob)
      }, "image/jpeg", 0.9)
    })
  }

  const handleConfirmCrop = async () => {
    if (!user || !cropImageUrl || !croppedAreaPixels) return

    setAvatarUploading(true)
    setStatusMsg("")

    try {
      const blob = await getCroppedImageBlob(cropImageUrl, croppedAreaPixels)
      const formData = new FormData()
      formData.append("image", blob, "avatar.jpg")

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({ error: "Error al subir la imagen" }))
        setStatusMsg(err.error || "Error al subir la imagen")
        setStatusMsgType("error")
        setTimeout(() => setStatusMsg(""), 3000)
        return
      }

      const uploadData = (await uploadRes.json()) as { url: string }
      const newAvatarUrl = uploadData.url

      const res = await fetch(`${API_URL}/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), avatarUrl: newAvatarUrl }),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Error al guardar la foto de perfil" }))
        setStatusMsg(error.error || "Error al guardar la foto de perfil")
        setStatusMsgType("error")
        setTimeout(() => setStatusMsg(""), 3000)
        return
      }

      const updatedUser = await res.json()
      const updated: User = { ...user, name: updatedUser.name, avatarUrl: updatedUser.avatarUrl }
      setUser(updated)
      setUserState(updated)
      setAvatarUrl(updated.avatarUrl || "")
      setStatusMsg("Foto de perfil actualizada")
      setStatusMsgType("success")
      setTimeout(() => setStatusMsg(""), 2000)
    } catch (err) {
      console.error(err)
      setStatusMsg("Error al actualizar la foto de perfil")
      setStatusMsgType("error")
      setTimeout(() => setStatusMsg(""), 3000)
    } finally {
      setAvatarUploading(false)
      if (cropImageUrl) {
        URL.revokeObjectURL(cropImageUrl)
      }
      setCropImageUrl(null)
      setIsCropOpen(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <Dialog
        open={isCropOpen}
        onOpenChange={(open) => {
          setIsCropOpen(open)
          if (!open && cropImageUrl) {
            URL.revokeObjectURL(cropImageUrl)
            setCropImageUrl(null)
            if (fileInputRef.current) {
              fileInputRef.current.value = ""
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajusta tu foto de perfil</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-64 bg-black/80 rounded-md overflow-hidden">
            {cropImageUrl && (
              <Cropper
                image={cropImageUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>
          <div className="flex items-center gap-3 mt-4">
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1"
            />
            <Button
              type="button"
              size="sm"
              className="rounded-full"
              disabled={avatarUploading}
              onClick={handleConfirmCrop}
            >
              {avatarUploading ? "Guardando..." : "Guardar recorte"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <main className="container px-4 sm:px-8 md:px-12 max-w-none mx-auto w-full py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Mi cuenta</CardTitle>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={name} />
                  <AvatarFallback>{name ? name[0] : "?"}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Foto de perfil</p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      disabled={avatarUploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {avatarUploading ? "Subiendo..." : "Cambiar foto"}
                    </Button>
                    <input
                      ref={fileInputRef}
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    readOnly 
                    disabled
                    className="bg-muted cursor-not-allowed"
                    placeholder="tu@email.com" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">El email no se puede modificar</p>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <Button onClick={handleSaveProfile} className="rounded-full">Guardar cambios</Button>
                {statusMsg && (
                  <span className={`text-sm font-medium ${
                    statusMsgType === "error" ? "text-destructive" : "text-green-600"
                  }`}>
                    {statusMsg}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cambiar contraseña</CardTitle>
              {passwordMsg && (
                <div className={`mt-3 text-sm font-medium ${
                  passwordMsgType === "error" ? "text-destructive" : "text-green-600"
                }`}>
                  {passwordMsg}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="current">Contraseña actual</Label>
                <Input 
                  id="current" 
                  type="password" 
                  name="currentPassword"
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña actual"
                />
              </div>
              <div>
                <Label htmlFor="new">Nueva contraseña</Label>
                <Input 
                  id="new" 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <Label htmlFor="confirm">Confirmar nueva contraseña</Label>
                <Input 
                  id="confirm" 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                />
              </div>
              <div className="flex gap-3 items-center flex-wrap">
                <Button variant="secondary" onClick={handleChangePassword} className="rounded-full">
                  Actualizar contraseña
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* <Card>
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
        </Card> */}
      </main>
    </div>
  )
}
