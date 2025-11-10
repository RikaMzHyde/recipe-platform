import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import '@/app/globals.css'

import HomePage from '@/app/page'
import FavoritesPage from '@/app/favorites/page'
import RecipeDetailPage from '@/app/recipe/[id]/page'
import EditRecipePage from '@/app/recipe/[id]/edit/page'
import AccountPage from '@/app/account/page'
import CreateRecipePage from '@/app/create-recipe/page'

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/favorites', element: <FavoritesPage /> },
  { path: '/account', element: <AccountPage /> },
  { path: '/recipe/:id', element: <RecipeDetailPage /> },
  { path: '/recipe/:id/edit', element: <EditRecipePage /> },
  { path: '/create-recipe', element: <CreateRecipePage /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
