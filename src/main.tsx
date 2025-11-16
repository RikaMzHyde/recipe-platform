import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import '@/pages/globals.css'
import { Layout } from '@/components/layout'
import { ThemeProvider } from '@/contexts/theme-context'

import HomePage from '@/pages/HomePage'
import FavoritesPage from '@/pages/FavoritesPage'
import RecipeDetailPage from '@/pages/RecipeDetailPage'
import EditRecipePage from '@/pages/EditRecipePage'
import AccountPage from '@/pages/AccountPage'
import CreateRecipePage from '@/pages/CreateRecipePage'
import MyRecipesPage from '@/pages/MyRecipesPage'

const router = createBrowserRouter([
  { path: '/', element: <Layout><HomePage /></Layout> },
  { path: '/favorites', element: <Layout><FavoritesPage /></Layout> },
  { path: '/account', element: <Layout><AccountPage /></Layout> },
  { path: '/my-recipes', element: <Layout><MyRecipesPage /></Layout> },
  { path: '/recipe/:id', element: <Layout><RecipeDetailPage /></Layout> },
  { path: '/recipe/:id/edit', element: <Layout><EditRecipePage /></Layout> },
  { path: '/create-recipe', element: <Layout><CreateRecipePage /></Layout> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
)
