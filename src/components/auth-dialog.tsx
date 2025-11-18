import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { fetchSecurityQuestions, getRandomSecurityQuestion, type SecurityQuestion } from "@/lib/security-questions"
import { API_URL } from "@/lib/api"

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AuthDialog({ open, onOpenChange, onSuccess }: AuthDialogProps) {
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("")
  const [registerSecurityQuestionId, setRegisterSecurityQuestionId] = useState<number | null>(null)
  const [registerSecurityQuestion, setRegisterSecurityQuestion] = useState("")
  const [registerSecurityAnswer, setRegisterSecurityAnswer] = useState("")
  const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestion[]>([])
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true)
  const [error, setError] = useState("")

  // Mostrar/ocultar sección de recuperación dentro de login
  const [showResetSection, setShowResetSection] = useState(false)
  
  // Estados para recuperación de contraseña
  const [resetEmail, setResetEmail] = useState("")
  const [resetSecurityQuestion, setResetSecurityQuestion] = useState("")
  const [resetSecurityAnswer, setResetSecurityAnswer] = useState("")
  const [resetNewPassword, setResetNewPassword] = useState("")
  const [resetConfirmPassword, setResetConfirmPassword] = useState("")
  const [resetStep, setResetStep] = useState<"email" | "question">("email")

  const { toast } = useToast()
  // login() actualizará el usuario en el AuthProvider cuando el backend devuelva credenciales válidas
  const { login } = useAuth()

  // Cargar preguntas de seguridad al montar el componente
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoadingQuestions(true)
        const questions = await fetchSecurityQuestions()
        console.log('Preguntas cargadas:', questions.length)
        setSecurityQuestions(questions)
        if (questions.length > 0) {
          const randomQuestion = getRandomSecurityQuestion(questions)
          setRegisterSecurityQuestionId(randomQuestion.id)
          setRegisterSecurityQuestion(randomQuestion.question)
        } else {
          console.error('No se pudieron cargar las preguntas')
        }
      } catch (e) {
        console.error('Error cargando preguntas:', e)
      } finally {
        setIsLoadingQuestions(false)
      }
    }
    loadQuestions()
  }, [])

  const showError = (message: string) => {
    setError(message)
    toast({
      variant: "destructive",
      description: message,
    })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error de autenticación" }))
        const message = err.error || "Credenciales inválidas"
        showError(message)
        return
      }
      const user = await res.json()
      // Guardamos el usuario en el contexto global de autenticación
      login(user)
      onSuccess()
      onOpenChange(false)
      setLoginEmail("")
      setLoginPassword("")
    } catch (e) {
      showError("No se pudo conectar con el servidor")
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    // Validar que las contraseñas coincidan
    if (registerPassword !== registerConfirmPassword) {
      showError("Las contraseñas no coinciden")
      return
    }
    
    // Validar longitud mínima de contraseña
    if (registerPassword.length < 6) {
      showError("La contraseña debe tener al menos 6 caracteres")
      return
    }
    
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: registerName, 
          email: registerEmail, 
          password: registerPassword,
          securityQuestionId: registerSecurityQuestionId,
          securityAnswer: registerSecurityAnswer
        }),
      })
      if (!res.ok) {
        if (res.status === 409) {
          showError("Ya existe una cuenta asociada a ese email")
          return
        }
        const err = await res.json().catch(() => ({ error: "Error de registro" }))
        const message = err.error || "No se pudo registrar"
        showError(message)
        return
      }
      const user = await res.json()
      // Guardamos el usuario en el contexto global de autenticación
      login(user)
      onSuccess()
      onOpenChange(false)
      setRegisterName("")
      setRegisterEmail("")
      setRegisterPassword("")
      setRegisterConfirmPassword("")
      setRegisterSecurityAnswer("")
      // Asignar nueva pregunta aleatoria
      if (securityQuestions.length > 0) {
        const randomQuestion = getRandomSecurityQuestion(securityQuestions)
        setRegisterSecurityQuestionId(randomQuestion.id)
        setRegisterSecurityQuestion(randomQuestion.question)
      }
    } catch (e) {
      showError("No se pudo conectar con el servidor")
    }
  }

  // Funciones para recuperación de contraseña
  const handleResetEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    try {
      const res = await fetch(`${API_URL}/api/auth/security-question?email=${encodeURIComponent(resetEmail)}`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error al verificar email" }))
        showError(err.error || "Email no registrado")
        return
      }
      
      const data = await res.json()
      setResetSecurityQuestion(data.question)
      setResetStep("question")
    } catch (e) {
      showError("No se pudo conectar con el servidor")
    }
  }

  const handleResetAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (resetNewPassword !== resetConfirmPassword) {
      showError("Las contraseñas no coinciden")
      return
    }

    if (resetNewPassword.length < 6) {
      showError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    try {
      // 1) Cambiar contraseña
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resetEmail,
          securityAnswer: resetSecurityAnswer,
          newPassword: resetNewPassword,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error al cambiar contraseña" }))
        showError(err.error || "No se pudo cambiar la contraseña")
        return
      }

      // 2) Auto-login con la nueva contraseña
      const loginRes = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resetEmail,
          password: resetNewPassword,
        }),
      })

      if (!loginRes.ok) {
        showError("Contraseña cambiada, pero no se pudo iniciar sesión automáticamente")
        return
      }

      const user = await loginRes.json()
      // Tras cambiar la contraseña iniciamos sesión automáticamente en el contexto global
      login(user)

      // Notificar éxito global (dejamos el diálogo abierto)
      onSuccess()
      onOpenChange(false)
      toast({
        variant: "default",
        className: "bg-green-500 text-white border-green-600",
        description: "Contraseña cambiada con éxito",
      })
    } catch (e) {
      showError("No se pudo conectar con el servidor")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Bienvenido</DialogTitle>
          <DialogDescription className="text-center">
            Inicia sesión o regístrate para compartir tus recetas
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="register">Registrarse</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <div className="space-y-4">
              {!showResetSection ? (
                <>
                  <LoginTab
                    loginEmail={loginEmail}
                    loginPassword={loginPassword}
                    error={error}
                    onSubmit={handleLogin}
                    onLoginEmailChange={setLoginEmail}
                    onLoginPasswordChange={setLoginPassword}
                  />

                  <div className="pt-2 border-t border-border/40 text-center">
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm"
                      onClick={() => setShowResetSection(true)}
                    >
                      ¿Has olvidado tu contraseña?
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <ResetPasswordTab
                    resetStep={resetStep}
                    resetEmail={resetEmail}
                    resetSecurityQuestion={resetSecurityQuestion}
                    resetSecurityAnswer={resetSecurityAnswer}
                    resetNewPassword={resetNewPassword}
                    resetConfirmPassword={resetConfirmPassword}
                    error={error}
                    onSubmitEmail={handleResetEmail}
                    onSubmitAnswer={handleResetAnswer}
                    onCancelFromEmail={() => {
                      setShowResetSection(false)
                      setResetStep("email")
                      setResetEmail("")
                      setError("")
                    }}
                    onCancelFromQuestion={() => {
                      setShowResetSection(false)
                      setResetStep("email")
                      setResetEmail("")
                      setResetSecurityAnswer("")
                      setResetNewPassword("")
                      setResetConfirmPassword("")
                      setResetSecurityQuestion("")
                      setError("")
                    }}
                    onResetEmailChange={setResetEmail}
                    onResetSecurityAnswerChange={setResetSecurityAnswer}
                    onResetNewPasswordChange={setResetNewPassword}
                    onResetConfirmPasswordChange={setResetConfirmPassword}
                  />
                </>
              )}
            </div>
          </TabsContent>
          <TabsContent value="register">
            <RegisterTab
              registerName={registerName}
              registerEmail={registerEmail}
              registerPassword={registerPassword}
              registerConfirmPassword={registerConfirmPassword}
              registerSecurityQuestion={registerSecurityQuestion}
              registerSecurityQuestionId={registerSecurityQuestionId}
              registerSecurityAnswer={registerSecurityAnswer}
              isLoadingQuestions={isLoadingQuestions}
              securityQuestions={securityQuestions}
              error={error}
              onSubmit={handleRegister}
              onRegisterNameChange={setRegisterName}
              onRegisterEmailChange={setRegisterEmail}
              onRegisterPasswordChange={setRegisterPassword}
              onRegisterConfirmPasswordChange={setRegisterConfirmPassword}
              onRegisterSecurityAnswerChange={setRegisterSecurityAnswer}
              onRegisterSecurityQuestionChange={(id, question) => {
                setRegisterSecurityQuestionId(id)
                setRegisterSecurityQuestion(question)
              }}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

interface LoginTabProps {
  loginEmail: string
  loginPassword: string
  error: string
  onSubmit: (e: React.FormEvent) => void
  onLoginEmailChange: (value: string) => void
  onLoginPasswordChange: (value: string) => void
}

function LoginTab({
  loginEmail,
  loginPassword,
  error,
  onSubmit,
  onLoginEmailChange,
  onLoginPasswordChange,
}: LoginTabProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="tu@email.com"
          value={loginEmail}
          onChange={(e) => onLoginEmailChange(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Contraseña</Label>
        <Input
          id="login-password"
          type="password"
          placeholder="••••••"
          value={loginPassword}
          onChange={(e) => onLoginPasswordChange(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full">
        Iniciar Sesión
      </Button>
    </form>
  )
}

interface RegisterTabProps {
  registerName: string
  registerEmail: string
  registerPassword: string
  registerConfirmPassword: string
  registerSecurityQuestion: string
  registerSecurityQuestionId: number | null
  registerSecurityAnswer: string
  isLoadingQuestions: boolean
  securityQuestions: SecurityQuestion[]
  error: string
  onSubmit: (e: React.FormEvent) => void
  onRegisterNameChange: (value: string) => void
  onRegisterEmailChange: (value: string) => void
  onRegisterPasswordChange: (value: string) => void
  onRegisterConfirmPasswordChange: (value: string) => void
  onRegisterSecurityAnswerChange: (value: string) => void
  onRegisterSecurityQuestionChange: (id: number, question: string) => void
}

function RegisterTab({
  registerName,
  registerEmail,
  registerPassword,
  registerConfirmPassword,
  registerSecurityQuestion,
  registerSecurityQuestionId,
  registerSecurityAnswer,
  isLoadingQuestions,
  securityQuestions,
  error,
  onSubmit,
  onRegisterNameChange,
  onRegisterEmailChange,
  onRegisterPasswordChange,
  onRegisterConfirmPasswordChange,
  onRegisterSecurityAnswerChange,
  onRegisterSecurityQuestionChange,
}: RegisterTabProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-name">Nombre</Label>
        <Input
          id="register-name"
          type="text"
          placeholder="Tu nombre"
          value={registerName}
          onChange={(e) => onRegisterNameChange(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <Input
          id="register-email"
          type="email"
          placeholder="tu@email.com"
          value={registerEmail}
          onChange={(e) => onRegisterEmailChange(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-password">Contraseña</Label>
        <Input
          id="register-password"
          type="password"
          placeholder="••••••"
          value={registerPassword}
          onChange={(e) => onRegisterPasswordChange(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-confirm-password">Confirmar contraseña</Label>
        <Input
          id="register-confirm-password"
          type="password"
          placeholder="••••••"
          value={registerConfirmPassword}
          onChange={(e) => onRegisterConfirmPasswordChange(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-security-question">Pregunta de seguridad</Label>
        {isLoadingQuestions ? (
          <p className="text-sm text-muted-foreground">Cargando preguntas...</p>
        ) : securityQuestions.length === 0 ? (
          <p className="text-sm text-destructive">No se pudieron cargar las preguntas de seguridad</p>
        ) : (
          <Select
            value={
              registerSecurityQuestionId !== null
                ? registerSecurityQuestionId.toString()
                : ""
            }
            onValueChange={(value) => {
              const id = Number(value)
              const question = securityQuestions.find((q) => q.id === id)
              if (question) {
                onRegisterSecurityQuestionChange(question.id, question.question)
              }
            }}
          >
            <SelectTrigger id="register-security-question">
              <SelectValue placeholder="Selecciona una pregunta..." />
            </SelectTrigger>
            <SelectContent>
              {securityQuestions.map((q) => (
                <SelectItem key={q.id} value={q.id.toString()}>
                  {q.question}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-security-answer">Respuesta de seguridad</Label>
        <Input
          id="register-security-answer"
          type="text"
          placeholder="Tu respuesta (importante para recuperar contraseña)"
          value={registerSecurityAnswer}
          onChange={(e) => onRegisterSecurityAnswerChange(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full">
        Registrarse
      </Button>
    </form>
  )
}

interface ResetPasswordTabProps {
  resetStep: "email" | "question"
  resetEmail: string
  resetSecurityQuestion: string
  resetSecurityAnswer: string
  resetNewPassword: string
  resetConfirmPassword: string
  error: string
  onSubmitEmail: (e: React.FormEvent) => void
  onSubmitAnswer: (e: React.FormEvent) => void
  onCancelFromEmail: () => void
  onCancelFromQuestion: () => void
  onResetEmailChange: (value: string) => void
  onResetSecurityAnswerChange: (value: string) => void
  onResetNewPasswordChange: (value: string) => void
  onResetConfirmPasswordChange: (value: string) => void
}

function ResetPasswordTab({
  resetStep,
  resetEmail,
  resetSecurityQuestion,
  resetSecurityAnswer,
  resetNewPassword,
  resetConfirmPassword,
  error,
  onSubmitEmail,
  onSubmitAnswer,
  onCancelFromEmail,
  onCancelFromQuestion,
  onResetEmailChange,
  onResetSecurityAnswerChange,
  onResetNewPasswordChange,
  onResetConfirmPasswordChange,
}: ResetPasswordTabProps) {
  return (
    <div className="space-y-4">
      {resetStep === "email" && (
            <form onSubmit={onSubmitEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={resetEmail}
                  onChange={(e) => onResetEmailChange(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full">
                Continuar
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={onCancelFromEmail}
              >
                Volver a iniciar sesión
              </Button>
            </form>
          )}

      {resetStep === "question" && (
            <form onSubmit={onSubmitAnswer} className="space-y-4">
              <div className="space-y-2">
                <Label>Pregunta de seguridad</Label>
                <p className="text-sm text-muted-foreground font-medium">{resetSecurityQuestion}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reset-security-answer">Respuesta</Label>
                <Input
                  id="reset-security-answer"
                  type="text"
                  placeholder="Tu respuesta"
                  value={resetSecurityAnswer}
                  onChange={(e) => onResetSecurityAnswerChange(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reset-new-password">Nueva contraseña</Label>
                <Input
                  id="reset-new-password"
                  type="password"
                  placeholder="••••••"
                  value={resetNewPassword}
                  onChange={(e) => onResetNewPasswordChange(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reset-confirm-password">Confirmar nueva contraseña</Label>
                <Input
                  id="reset-confirm-password"
                  type="password"
                  placeholder="••••••"
                  value={resetConfirmPassword}
                  onChange={(e) => onResetConfirmPasswordChange(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full">
                Cambiar contraseña
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={onCancelFromQuestion}
              >
                Volver a iniciar sesión
              </Button>
            </form>
          )}
    </div>
  )
}
