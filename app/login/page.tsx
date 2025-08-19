"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import LoginForm from "@/components/login-form"

export default function LoginPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (!isLoading && user) {
      setRedirecting(true)
      // Redirecionar baseado no nível do usuário
      if (user.level3_access) {
        router.push("/level3")
      } else if (user.level2_access) {
        router.push("/level2")
      } else if (user.level1_access) {
        router.push("/level1")
      } else {
        router.push("/")
      }
    }
  }, [user, isLoading, router])

  const handleLoginSuccess = () => {
    // O redirecionamento será feito pelo useEffect
  }

  if (isLoading || redirecting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  )
}
