import KanbanBoard from "@/components/kanban-board"
import ProtectedRoute from "@/components/protected-route"

export default function Level2Page() {
  return (
    <ProtectedRoute requiredLevel={2}>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard de Suporte</h1>
          <p className="text-muted-foreground">Nível 2 - Gestão de Chamados</p>
        </div>
        <KanbanBoard />
      </div>
    </ProtectedRoute>
  )
}
