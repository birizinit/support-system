"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredLevel: 1 | 2 | 3
  fallback?: React.ReactNode
}

export default function ProtectedRoute({ 
  children, 
  requiredLevel, 
  fallback 
}: ProtectedRouteProps) {
  const { user, isLoading, logout, hasAccess } = useAuth()
  const router = useRouter()
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login")
        return
      }

      if (!hasAccess(requiredLevel)) {
        setShowFallback(true)
        return
      }
    }
  }, [user, isLoading, requiredLevel, router])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecionando para login...</p>
        </div>
      </div>
    )
  }

  if (showFallback) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <img 
              src="/3b35bf84-d5f6-4a2d-b61c-9c8ff1b4c125.jpg" 
              alt="Logo" 
              className="h-16 w-auto mx-auto mb-4 rounded"
            />
          </div>
          
                   <h1 className="text-2xl font-bold text-foreground mb-4">Acesso Negado</h1>
           <p className="text-muted-foreground mb-6">
             Você não tem permissão para acessar esta área. 
             Esta área requer nível {requiredLevel}.
           </p>
          
          <div className="space-y-3">
            <Button 
              onClick={() => router.push("/")}
              className="w-full"
            >
              Voltar ao Início
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Fazer Logout
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header com informações do usuário */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                <img 
                  src="/3b35bf84-d5f6-4a2d-b61c-9c8ff1b4c125.jpg" 
                  alt="Logo" 
                  className="h-8 w-auto rounded"
                />
              </a>
                           <div className="text-sm text-muted-foreground">
                 Logado como: <span className="font-medium text-foreground">{user.atendente}</span>
                 <span className="mx-2">•</span>
                 Usuário: <span className="font-medium text-foreground">{user.username}</span>
               </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="text-xs"
            >
              <LogOut className="h-3 w-3 mr-1" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo da página */}
      {children}
    </div>
  )
}
