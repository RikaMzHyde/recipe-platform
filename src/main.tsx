import React from 'react'
import ReactDOM from 'react-dom/client'
// React Router: creación del router y proveedor
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// Estilos globales de la app
import '@/pages/globals.css'
// Layout común que envuelve todas las páginas
import { Layout } from '@/components/layout'
// Contextos globales
import { ThemeProvider } from '@/contexts/theme-context'
import { AuthProvider } from '@/contexts/auth-context'

import HomePage from '@/pages/HomePage'
import FavoritesPage from '@/pages/FavoritesPage'
import RecipeDetailPage from '@/pages/RecipeDetailPage'
import EditRecipePage from '@/pages/EditRecipePage'
import AccountPage from '@/pages/AccountPage'
import CreateRecipePage from '@/pages/CreateRecipePage'
import MyRecipesPage from '@/pages/MyRecipesPage'
import UserProfilePage from '@/pages/UserProfilePage'

// Definimos las rutas principales de la aplicación (cada una envuelta en el Layout común)
const router = createBrowserRouter([
  { path: '/', element: <Layout><HomePage /></Layout> },
  { path: '/favorites', element: <Layout><FavoritesPage /></Layout> },
  { path: '/account', element: <Layout><AccountPage /></Layout> },
  { path: '/my-recipes', element: <Layout><MyRecipesPage /></Layout> },
  { path: '/user/:id', element: <Layout><UserProfilePage /></Layout> },
  { path: '/recipe/:id', element: <Layout><RecipeDetailPage /></Layout> },
  { path: '/recipe/:id/edit', element: <Layout><EditRecipePage /></Layout> },
  { path: '/create-recipe', element: <Layout><CreateRecipePage /></Layout> },
])

// Punto de entrada de la aplicación
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Proveedor de tema (modo claro/oscuro) */}
    <ThemeProvider>
      {/* Proveedor de autenticación: expone useAuth() al resto de componentes */}
      <AuthProvider>
        {/* Inyecta el router con todas las páginas definidas arriba */}
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
