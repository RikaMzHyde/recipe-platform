// Obtener preguntas de seguridad desde la API
export interface SecurityQuestion {
  id: number
  question: string
}

// Preguntas de respaldo por si la API falla
const FALLBACK_QUESTIONS: SecurityQuestion[] = [
  { id: 1, question: "¿Cuál era el nombre de tu primera mascota?" },
  { id: 2, question: "¿En qué ciudad naciste?" },
  { id: 3, question: "¿Cuál es tu película favorita?" },
  { id: 4, question: "¿Cuál era tu comida infantil preferida?" },
  { id: 5, question: "¿Cuál es el nombre de tu mejor amigo de la infancia?" },
  { id: 6, question: "¿Cuál fue tu primer coche?" },
  { id: 7, question: "¿Cuál es tu canción favorita?" },
  { id: 8, question: "¿En qué escuela primaria estudiaste?" },
  { id: 9, question: "¿Cuál es tu deporte favorito?" },
  { id: 10, question: "¿Cuál es tu libro favorito?" }
]

// Obtener preguntas desde el backend
export async function fetchSecurityQuestions(): Promise<SecurityQuestion[]> {
  try {
    const res = await fetch('/api/auth/security-questions')
    if (!res.ok) {
      console.warn('API no disponible, usando preguntas de respaldo')
      return FALLBACK_QUESTIONS
    }
    const data = await res.json()
    return data.questions || FALLBACK_QUESTIONS
  } catch (e) {
    console.error('Error fetching security questions, usando fallback:', e)
    return FALLBACK_QUESTIONS
  }
}

// Obtener una pregunta aleatoria del array
export function getRandomSecurityQuestion(questions: SecurityQuestion[]): SecurityQuestion {
  if (questions.length === 0) {
    console.error('No hay preguntas disponibles')
    return FALLBACK_QUESTIONS[0] // Devolver la primera como último recurso
  }
  const randomIndex = Math.floor(Math.random() * questions.length)
  return questions[randomIndex]
}
