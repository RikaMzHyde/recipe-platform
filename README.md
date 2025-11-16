# Kokumi – Plataforma de Recetas

Este repositorio contiene una pequeña plataforma de recetas desarrollada como **proyecto de clase**. 

El objetivo principal no es hacer un producto perfecto, sino practicar con React, Vite y TypeScript mientras construyo algo útil y un poco bonito.

---

## 1. ¿Qué hace la aplicación?

- Muestra recetas con una estética "kawaii".
- Permite marcar recetas como favoritas.
- Permite crear y editar recetas (según permisos).
- Incluye una página de cuenta de usuario con información básica.

No pretende ser una aplicación completa de producción, sino un ejercicio práctico de desarrollo web.

---

## 2. Tecnologías utilizadas

- **React 18** como librería de interfaz.
- **Vite** como bundler y dev server.
- **TypeScript** para tipado estático.
- **React Router DOM** para el enrutado en el frontend.
- **TailwindCSS 4** para los estilos.
- Componentes de UI basados en la idea de **shadcn/ui** y **Radix UI**.

---

## 3. Cómo ejecutar el proyecto

En la carpeta raíz del proyecto:

1. Instala las dependencias (puedes usar la herramienta que prefieras):

   ```bash
   npm install
   # o
   pnpm install
   # o
   bun install
   ```

2. Arranca el servidor de desarrollo:

   ```bash
   npm run dev
   # o
   pnpm dev
   # o
   bun dev
   ```

3. Abre el navegador en la URL que indique Vite (normalmente):

   ```text
   http://localhost:5173
   ```

### Variables de entorno

Opcionalmente, se puede crear un archivo `.env.local` en la raíz para configurar por ejemplo la URL de la API:

```env
VITE_API_URL=http://localhost:5174/api
```

En `vite.config.ts` hay un proxy para `/api`, pensado para apuntar al backend durante el desarrollo.

---

## 4. Estructura básica del proyecto

No es una estructura perfecta, pero a grandes rasgos es así:

```text
root/
  index.html
  package.json
  vite.config.ts
  tsconfig.json
  src/
    main.tsx          # Punto de entrada de React + Router
    pages/            # Páginas principales de la app
      HomePage.tsx
      FavoritesPage.tsx
      AccountPage.tsx
      CreateRecipePage.tsx
      RecipeDetailPage.tsx
      EditRecipePage.tsx
      globals.css     # Estilos globales y tema de colores
    components/       # Componentes reutilizables (Navbar, cards, formularios...)
    lib/              # Lógica de dominio (auth, recipes, utilidades)
    contexts/         # Contextos de React (tema, etc.)
    hooks/            # Hooks personalizados
```

### Alias `@`

En `vite.config.ts` y en `tsconfig.json` el alias `@` apunta a `src/`, así que se pueden usar imports como:

```ts
import { Navbar } from "@/components/navbar";
import HomePage from "@/pages/HomePage";
```

---

## 5. Notas sobre estilos

Los estilos globales están en `src/pages/globals.css`. Ahí se define:

- La paleta de colores pastel (modo claro y modo oscuro).
- Algunas utilidades básicas para cursores y elementos interactivos.

La idea es más estética que perfecta: simplemente buscar un estilo coherente para el proyecto de clase.

---

## 6. Sobre la licencia / uso

Este proyecto se ha creado como parte de un **proyecto académico**. 

El código está pensado principalmente para uso educativo y evaluación en el contexto del centro de estudios. Si alguien quiere reutilizar partes del proyecto, lo ideal es consultarlo antes con el profesor o el propio autor.

---

## 7. Autor

Proyecto desarrollado como práctica de desarrollo web.

```text
Hecho por Laura P.
```

