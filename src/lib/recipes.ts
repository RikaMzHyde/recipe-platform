export interface Ingredient {
  name: string
  amount: string
}

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

export interface Category {
  id: number
  name: string
}

// Para mantener compatibilidad con el código existente
export interface LegacyRecipe {
  id: string
  title: string
  description: string
  category: string
  ingredients: string[]
  instructions: string[]
  prepTime: string
  cookTime: string
  servings: number
  difficulty: "Fácil" | "Media" | "Difícil"
  image: string
  author: string
  authorAvatar: string
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5174'

// API Functions
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

export async function createRecipeWithImage(formData: FormData): Promise<Recipe> {
  const response = await fetch(`${API_URL}/api/recipes/with-image`, {
    method: 'POST',
    body: formData,
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al crear la receta')
  }
  
  return await response.json()
}

export const mockRecipes: LegacyRecipe[] = [
  {
    id: "1",
    title: "Ramen Casero Japonés",
    description: "Un delicioso ramen con caldo rico y fideos perfectos",
    category: "Asiática",
    ingredients: [
      "400g de fideos ramen",
      "1L de caldo de pollo",
      "2 huevos",
      "200g de cerdo chashu",
      "Cebollín picado",
      "Alga nori",
      "Brotes de bambú",
    ],
    instructions: [
      "Prepara el caldo de pollo con huesos y verduras durante 4 horas",
      "Cocina los fideos según las instrucciones del paquete",
      "Hierve los huevos durante 6 minutos para que queden cremosos",
      "Corta el cerdo chashu en láminas finas",
      "Sirve los fideos en un bowl, añade el caldo caliente",
      "Decora con huevo, cerdo, cebollín, nori y brotes de bambú",
    ],
    prepTime: "30 min",
    cookTime: "4 horas",
    servings: 4,
    difficulty: "Difícil",
    image: "/delicious-japanese-ramen-bowl-with-egg-and-pork.jpg",
    author: "María García",
    authorAvatar: "/cute-avatar-girl-chef.jpg",
  },
  {
    id: "2",
    title: "Pizza Margherita Clásica",
    description: "La auténtica pizza italiana con ingredientes frescos",
    category: "Italiana",
    ingredients: [
      "500g de harina de trigo",
      "300ml de agua tibia",
      "10g de levadura fresca",
      "400g de tomate triturado",
      "250g de mozzarella fresca",
      "Albahaca fresca",
      "Aceite de oliva",
      "Sal",
    ],
    instructions: [
      "Mezcla la harina con la levadura disuelta en agua tibia",
      "Amasa durante 10 minutos hasta obtener una masa elástica",
      "Deja reposar la masa cubierta durante 2 horas",
      "Extiende la masa en forma circular",
      "Añade el tomate triturado, mozzarella y un chorrito de aceite",
      "Hornea a 250°C durante 10-12 minutos",
      "Decora con albahaca fresca al sacar del horno",
    ],
    prepTime: "2 horas 30 min",
    cookTime: "12 min",
    servings: 2,
    difficulty: "Media",
    image: "/classic-margherita-pizza.png",
    author: "Carlos Rossi",
    authorAvatar: "/cute-avatar-boy-chef.jpg",
  },
  {
    id: "3",
    title: "Pad Thai Vegetariano",
    description: "Fideos tailandeses salteados con vegetales crujientes",
    category: "Asiática",
    ingredients: [
      "200g de fideos de arroz",
      "2 huevos",
      "100g de tofu firme",
      "Brotes de soja",
      "Zanahoria rallada",
      "Cebollín",
      "Cacahuetes triturados",
      "Salsa de tamarindo",
      "Salsa de pescado vegana",
      "Lima",
    ],
    instructions: [
      "Remoja los fideos en agua caliente durante 15 minutos",
      "Corta el tofu en cubos y fríelo hasta que esté dorado",
      "Bate los huevos y haz una tortilla fina, córtala en tiras",
      "Saltea los fideos escurridos en un wok caliente",
      "Añade las salsas, tofu, huevo y vegetales",
      "Sirve con cacahuetes, lima y brotes de soja frescos",
    ],
    prepTime: "20 min",
    cookTime: "15 min",
    servings: 2,
    difficulty: "Media",
    image: "/colorful-pad-thai-noodles-with-vegetables.jpg",
    author: "Ana Martínez",
    authorAvatar: "/cute-avatar-girl-with-glasses.jpg",
  },
  {
    id: "4",
    title: "Tacos al Pastor",
    description: "Tacos mexicanos con carne marinada y piña",
    category: "Mexicana",
    ingredients: [
      "500g de carne de cerdo",
      "3 chiles guajillo",
      "2 chiles ancho",
      "Piña fresca",
      "Cebolla",
      "Cilantro",
      "Tortillas de maíz",
      "Jugo de naranja",
      "Vinagre",
      "Especias mexicanas",
    ],
    instructions: [
      "Hidrata los chiles y licúalos con especias y jugo de naranja",
      "Marina la carne en la salsa durante 4 horas",
      "Cocina la carne en una sartén o parrilla",
      "Corta la carne en trozos pequeños",
      "Calienta las tortillas",
      "Sirve con cebolla, cilantro y piña picada",
    ],
    prepTime: "4 horas 20 min",
    cookTime: "20 min",
    servings: 6,
    difficulty: "Media",
    image: "/mexican-tacos-al-pastor-with-pineapple.jpg",
    author: "Luis Hernández",
    authorAvatar: "/cute-avatar-boy-with-mustache.jpg",
  },
  {
    id: "5",
    title: "Sushi Rolls Caseros",
    description: "Deliciosos rolls de sushi con salmón y aguacate",
    category: "Asiática",
    ingredients: [
      "300g de arroz para sushi",
      "4 hojas de alga nori",
      "200g de salmón fresco",
      "1 aguacate",
      "1 pepino",
      "Vinagre de arroz",
      "Salsa de soja",
      "Wasabi",
      "Jengibre encurtido",
    ],
    instructions: [
      "Cocina el arroz y mézclalo con vinagre de arroz",
      "Coloca el alga nori sobre una esterilla de bambú",
      "Extiende una capa fina de arroz sobre el alga",
      "Añade tiras de salmón, aguacate y pepino en el centro",
      "Enrolla firmemente usando la esterilla",
      "Corta en 8 piezas con un cuchillo afilado mojado",
      "Sirve con salsa de soja, wasabi y jengibre",
    ],
    prepTime: "40 min",
    cookTime: "20 min",
    servings: 4,
    difficulty: "Difícil",
    image: "/beautiful-sushi-rolls-with-salmon-and-avocado.jpg",
    author: "Yuki Tanaka",
    authorAvatar: "/cute-avatar-asian-girl.jpg",
  },
  {
    id: "6",
    title: "Lasaña Boloñesa",
    description: "Lasaña italiana con carne y bechamel cremosa",
    category: "Italiana",
    ingredients: [
      "12 láminas de pasta para lasaña",
      "500g de carne molida",
      "400g de tomate triturado",
      "500ml de leche",
      "50g de mantequilla",
      "50g de harina",
      "Cebolla",
      "Ajo",
      "Queso parmesano",
      "Mozzarella",
    ],
    instructions: [
      "Prepara la salsa boloñesa con carne, tomate, cebolla y ajo",
      "Haz la bechamel derritiendo mantequilla, añadiendo harina y leche",
      "Cocina las láminas de pasta según instrucciones",
      "En una fuente, alterna capas de pasta, boloñesa y bechamel",
      "Termina con bechamel y quesos rallados",
      "Hornea a 180°C durante 30-40 minutos hasta que esté dorada",
    ],
    prepTime: "30 min",
    cookTime: "1 hora",
    servings: 6,
    difficulty: "Media",
    image: "/delicious-lasagna-with-cheese.jpg",
    author: "Sofia Romano",
    authorAvatar: "/cute-avatar-italian-girl.jpg",
  },
  {
    id: "7",
    title: "Curry Verde Tailandés",
    description: "Curry aromático con leche de coco y vegetales",
    category: "Asiática",
    ingredients: [
      "400ml de leche de coco",
      "3 cucharadas de pasta de curry verde",
      "300g de pollo o tofu",
      "Berenjena tailandesa",
      "Pimientos",
      "Albahaca tailandesa",
      "Salsa de pescado",
      "Azúcar de palma",
      "Lima",
    ],
    instructions: [
      "Calienta un poco de leche de coco y fríe la pasta de curry",
      "Añade el pollo o tofu y cocina hasta sellar",
      "Agrega el resto de la leche de coco",
      "Incorpora los vegetales cortados",
      "Sazona con salsa de pescado y azúcar",
      "Cocina hasta que los vegetales estén tiernos",
      "Sirve con arroz jazmín y albahaca fresca",
    ],
    prepTime: "15 min",
    cookTime: "25 min",
    servings: 4,
    difficulty: "Fácil",
    image: "/thai-green-curry.png",
    author: "Somchai Wong",
    authorAvatar: "/cute-avatar-thai-chef.jpg",
  },
  {
    id: "8",
    title: "Paella Valenciana",
    description: "La auténtica paella española con mariscos",
    category: "Española",
    ingredients: [
      "400g de arroz bomba",
      "200g de gambas",
      "200g de mejillones",
      "200g de calamares",
      "1L de caldo de pescado",
      "Azafrán",
      "Pimientos rojos",
      "Guisantes",
      "Ajo",
      "Aceite de oliva",
      "Limón",
    ],
    instructions: [
      "Sofríe el ajo y los pimientos en aceite de oliva",
      "Añade los calamares y cocina unos minutos",
      "Incorpora el arroz y tuesta ligeramente",
      "Agrega el caldo caliente con azafrán",
      "Distribuye las gambas y mejillones por encima",
      "Cocina a fuego medio-alto sin remover durante 18-20 minutos",
      "Deja reposar 5 minutos y sirve con limón",
    ],
    prepTime: "20 min",
    cookTime: "30 min",
    servings: 4,
    difficulty: "Media",
    image: "/spanish-paella-with-seafood.jpg",
    author: "Carmen Valencia",
    authorAvatar: "/cute-avatar-spanish-woman.jpg",
  },
]

export function getRecipeById(id: string): LegacyRecipe | undefined {
  return mockRecipes.find((recipe) => recipe.id === id)
}

export function searchRecipes(query: string, category?: string, ingredient?: string): LegacyRecipe[] {
  return mockRecipes.filter((recipe) => {
    const matchesQuery =
      !query ||
      recipe.title.toLowerCase().includes(query.toLowerCase()) ||
      recipe.description.toLowerCase().includes(query.toLowerCase())

    const matchesCategory = !category || recipe.category === category

    const matchesIngredient =
      !ingredient || recipe.ingredients.some((ing) => ing.toLowerCase().includes(ingredient.toLowerCase()))

    return matchesQuery && matchesCategory && matchesIngredient
  })
}

export const legacyCategories = ["Asiática", "Italiana", "Mexicana", "Española"]
