import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import UserManagement from "@/components/user-management"
import ProtectedRoute from "@/components/protected-route"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Users } from "lucide-react"

export default function Level3Page() {
  return (
    <ProtectedRoute requiredLevel={3}>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Administração - Nível 3</h1>
          <p className="text-muted-foreground">Painel administrativo completo com analytics e gestão de usuários</p>
        </div>

        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Gestão de Usuários
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="mt-6">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
