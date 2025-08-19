import Level1Form from "@/components/level1-form"
import ProtectedRoute from "@/components/protected-route"

export default function Level1Page() {
  return (
    <ProtectedRoute requiredLevel={1}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Suporte Técnico</h1>
            <p className="text-muted-foreground">Nível 1 - Abertura de Chamado</p>
          </div>
          <Level1Form />
        </div>
      </div>
    </ProtectedRoute>
  )
}
