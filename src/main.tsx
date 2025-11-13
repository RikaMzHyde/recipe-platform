import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import '@/app/globals.css'
import { Layout } from '@/components/layout'
import { ThemeProvider } from '@/contexts/theme-context'

import HomePage from '@/app/page'
import FavoritesPage from '@/app/favorites/page'
import RecipeDetailPage from '@/app/recipe/[id]/page'
import EditRecipePage from '@/app/recipe/[id]/edit/page'
import AccountPage from '@/app/account/page'
import CreateRecipePage from '@/app/create-recipe/page'

const router = createBrowserRouter([
  { path: '/', element: <Layout><HomePage /></Layout> },
  { path: '/favorites', element: <Layout><FavoritesPage /></Layout> },
  { path: '/account', element: <Layout><AccountPage /></Layout> },
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
