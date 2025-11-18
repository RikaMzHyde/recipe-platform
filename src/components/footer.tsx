import { Link } from "react-router-dom"
import { Github, Mail, Twitter } from "lucide-react"

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-border/40 bg-background/95">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary overflow-hidden">
                <img
                  src="/kokumi-logo.png"
                  alt="Kokumi logo"
                  className="h-8 w-8 object-contain"
                />
              </div>
              <span className="text-xl font-semibold tracking-tight kokumi-logo-text">Kokumi</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Descubre, comparte y valora recetas deliciosas con una experiencia
              cuidada y divertida.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wide">Navegación</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground">Inicio</Link>
              </li>
              <li>
                <Link to="/favorites" className="text-muted-foreground hover:text-foreground">Favoritos</Link>
              </li>
              <li>
                <Link to="/my-recipes" className="text-muted-foreground hover:text-foreground">Mis recetas</Link>
              </li>
              <li>
                <Link to="/create-recipe" className="text-muted-foreground hover:text-foreground">Crear receta</Link>
              </li>
              <li>
                <Link to="/account" className="text-muted-foreground hover:text-foreground">Mi cuenta</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wide">Soporte</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground">Centro de ayuda</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground">Contacto</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground">Preguntas frecuentes</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground">Reportar problema</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wide">Mantente al día</h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Novedades, recetas destacadas y tips semanales.
            </p>
            <form
              className="mt-4 flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                alert("¡Gracias por suscribirte!")
              }}
            >
              <input
                type="email"
                required
                placeholder="Tu email"
                className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:opacity-90"
              >
                Suscribirme
              </button>
            </form>

            <div className="mt-6 flex items-center gap-4 text-muted-foreground">
              <a href="#" aria-label="Twitter" className="hover:text-foreground">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" aria-label="GitHub" className="hover:text-foreground">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Email" className="hover:text-foreground">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© {year} Kokumi. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4 text-xs">
            <a href="#" className="text-muted-foreground hover:text-foreground">Privacidad</a>
            <a href="#" className="text-muted-foreground hover:text-foreground">Términos</a>
            <a href="#" className="text-muted-foreground hover:text-foreground">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
