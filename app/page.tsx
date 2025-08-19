"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HeadphonesIcon, LayoutDashboard } from "lucide-react"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      // Se já está logado, redirecionar para o nível apropriado
      if (user.level3_access) {
        router.push("/level3")
      } else if (user.level2_access) {
        router.push("/level2")
      } else if (user.level1_access) {
        router.push("/level1")
      }
    }
  }, [user, isLoading, router])

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* XCode Tech Logo */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <img 
                src="/xcodetech-logo.png" 
                alt="XCode Tech" 
                className="h-16 w-auto"
              />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-foreground mb-4">Sistema de Suporte Técnico</h1>
          <p className="text-xl text-muted-foreground mb-2">Powered by XCode Tech</p>
          <p className="text-lg text-muted-foreground mb-12">Escolha seu nível de acesso para continuar</p>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  <HeadphonesIcon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Nível 1</CardTitle>
                <CardDescription>Abertura de chamados de suporte técnico</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/login">
                  <Button className="w-full h-12 text-base">Acessar Nível 1</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-accent/10 rounded-full w-fit">
                  <LayoutDashboard className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="text-xl">Nível 2</CardTitle>
                <CardDescription>Dashboard Kanban para gestão de chamados</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/login">
                  <Button variant="outline" className="w-full h-12 text-base bg-transparent">
                    Acessar Nível 2
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-chart-1/10 rounded-full w-fit">
                  <svg className="h-8 w-8 text-chart-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-xl">Nível 3</CardTitle>
                <CardDescription>Analytics e métricas avançadas do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/login">
                  <Button variant="secondary" className="w-full h-12 text-base">
                    Acessar Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
