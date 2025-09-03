"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { RefreshCw, Clock, User, Mail, Calendar, GripVertical, Plus, Edit2, Trash2, Settings } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import TicketDetailModal from "./ticket-detail-modal"
import ResolveTicketModal from "./resolve-ticket-modal"
// WhatsApp sending is now handled via server-only API route

interface Ticket {
  id: string
  description: string
  priority: "baixa" | "media" | "alta" | "critica"
  status: string // Changed from union type to string to support dynamic columns
  client_email: string
  broker_link?: string
  attendant: string
  created_at: string
  updated_at: string
  resolved_at?: string
  resolution_observation?: string
}

interface KanbanColumn {
  id: string
  key: string
  title: string
  color: string
  position: number
  is_protected: boolean
}

const colorOptions = [
  { value: "bg-slate-50 border-slate-200", label: "Cinza", preview: "bg-slate-200" },
  { value: "bg-orange-50 border-orange-200", label: "Laranja", preview: "bg-orange-200" },
  { value: "bg-yellow-50 border-yellow-200", label: "Amarelo", preview: "bg-yellow-200" },
  { value: "bg-lime-50 border-lime-200", label: "Lima", preview: "bg-lime-200" },
  { value: "bg-cyan-50 border-cyan-200", label: "Ciano", preview: "bg-cyan-200" },
  { value: "bg-indigo-50 border-indigo-200", label: "Índigo", preview: "bg-indigo-200" },
  { value: "bg-pink-50 border-pink-200", label: "Rosa", preview: "bg-pink-200" },
  { value: "bg-teal-50 border-teal-200", label: "Verde-azulado", preview: "bg-teal-200" },
]

const priorityColors = {
  baixa: "bg-green-100 text-green-800 border-green-200",
  media: "bg-yellow-100 text-yellow-800 border-yellow-200",
  alta: "bg-orange-100 text-orange-800 border-orange-200",
  critica: "bg-red-100 text-red-800 border-red-200",
}

export default function KanbanBoard() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [columns, setColumns] = useState<KanbanColumn[]>([]) // Added state for dynamic columns
  const [loading, setLoading] = useState(true)
  const [draggedTicket, setDraggedTicket] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false)
  const [ticketToResolve, setTicketToResolve] = useState<Ticket | null>(null)
  const [attendantPhones, setAttendantPhones] = useState<Record<string, string>>({})
  const [showColumnManagement, setShowColumnManagement] = useState(false) // Added state for column management UI

  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false)
  const [isEditColumnOpen, setIsEditColumnOpen] = useState(false)
  const [isDeleteColumnOpen, setIsDeleteColumnOpen] = useState(false)
  const [editingColumn, setEditingColumn] = useState<KanbanColumn | null>(null)
  const [deletingColumn, setDeletingColumn] = useState<KanbanColumn | null>(null)
  const [newColumnTitle, setNewColumnTitle] = useState("")
  const [newColumnColor, setNewColumnColor] = useState(colorOptions[0].value)

  const supabase = createClient()

  const fetchColumns = async () => {
    try {
      const { data, error } = await supabase.from("kanban_columns").select("*").order("position", { ascending: true })

      if (error) throw error
      setColumns(data || [])
    } catch (error) {
      console.error("Error fetching columns:", error)
    }
  }

  const createColumn = async (title: string, color: string) => {
    try {
      const existingColumn = columns.find((c) => c.title.toLowerCase() === title.toLowerCase())
      if (existingColumn) {
        alert("Já existe uma coluna com este nome. Escolha um nome diferente.")
        return
      }

      const maxPosition = Math.max(...columns.map((c) => c.position), 0)
      const key = title
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "")

      const existingKey = columns.find((c) => c.key === key)
      if (existingKey) {
        alert("Este nome geraria uma chave duplicada. Escolha um nome mais específico.")
        return
      }

      const { error } = await supabase.from("kanban_columns").insert({
        key,
        title,
        color,
        position: maxPosition + 1,
        is_protected: false,
      })

      if (error) {
        console.error("Database error:", error)
        alert("Erro ao criar coluna. Verifique se o nome não está duplicado.")
        return
      }

      await fetchColumns()
    } catch (error) {
      console.error("Error creating column:", error)
      alert("Erro ao criar coluna. Tente novamente.")
    }
  }

  const updateColumn = async (columnId: string, title: string, color: string) => {
    try {
      const column = columns.find((c) => c.id === columnId)
      if (column?.is_protected) {
        alert("Esta coluna é protegida e não pode ser modificada.")
        return
      }

      const existingColumn = columns.find((c) => c.id !== columnId && c.title.toLowerCase() === title.toLowerCase())
      if (existingColumn) {
        alert("Já existe uma coluna com este nome. Escolha um nome diferente.")
        return
      }

      const { error } = await supabase
        .from("kanban_columns")
        .update({ title, color })
        .eq("id", columnId)
        .eq("is_protected", false) // Additional protection at database level

      if (error) {
        console.error("Database error:", error)
        alert("Erro ao atualizar coluna. Verifique se o nome não está duplicado.")
        return
      }

      await fetchColumns()
    } catch (error) {
      console.error("Error updating column:", error)
      alert("Erro ao atualizar coluna. Tente novamente.")
    }
  }

  const deleteColumn = async (columnId: string) => {
    try {
      const column = columns.find((c) => c.id === columnId)
      if (column?.is_protected) {
        alert("Esta coluna é protegida e não pode ser excluída.")
        return
      }

      const columnTickets = tickets.filter((t) => t.status === column?.key)
      if (columnTickets.length > 0) {
        alert(
          `Não é possível excluir esta coluna pois ela contém ${columnTickets.length} chamado(s). Mova os chamados para outras colunas primeiro.`,
        )
        return
      }

      const { error } = await supabase.from("kanban_columns").delete().eq("id", columnId).eq("is_protected", false) // Additional protection at database level

      if (error) {
        console.error("Database error:", error)
        alert("Erro ao excluir coluna.")
        return
      }

      await fetchColumns()
    } catch (error) {
      console.error("Error deleting column:", error)
      alert("Erro ao excluir coluna. Tente novamente.")
    }
  }

  const handleAddColumn = async () => {
    if (!newColumnTitle.trim()) {
      alert("O nome da coluna não pode estar vazio.")
      return
    }

    if (newColumnTitle.trim().length < 2) {
      alert("O nome da coluna deve ter pelo menos 2 caracteres.")
      return
    }

    await createColumn(newColumnTitle.trim(), newColumnColor)
    setNewColumnTitle("")
    setNewColumnColor(colorOptions[0].value)
    setIsAddColumnOpen(false)
  }

  const handleEditColumn = async () => {
    if (!editingColumn) return

    if (editingColumn.is_protected) {
      alert("Esta coluna é protegida e não pode ser modificada.")
      setIsEditColumnOpen(false)
      return
    }

    if (!newColumnTitle.trim()) {
      alert("O nome da coluna não pode estar vazio.")
      return
    }

    if (newColumnTitle.trim().length < 2) {
      alert("O nome da coluna deve ter pelo menos 2 caracteres.")
      return
    }

    await updateColumn(editingColumn.id, newColumnTitle.trim(), newColumnColor)
    setEditingColumn(null)
    setNewColumnTitle("")
    setNewColumnColor(colorOptions[0].value)
    setIsEditColumnOpen(false)
  }

  const handleDeleteColumn = async () => {
    if (!deletingColumn) return

    if (deletingColumn.is_protected) {
      alert("Esta coluna é protegida e não pode ser excluída.")
      setIsDeleteColumnOpen(false)
      return
    }

    await deleteColumn(deletingColumn.id)
    setDeletingColumn(null)
    setIsDeleteColumnOpen(false)
  }

  const openEditModal = (column: KanbanColumn) => {
    if (column.is_protected) {
      alert("Esta coluna é protegida e não pode ser modificada.")
      return
    }

    setEditingColumn(column)
    setNewColumnTitle(column.title)
    setNewColumnColor(column.color)
    setIsEditColumnOpen(true)
  }

  const openDeleteModal = (column: KanbanColumn) => {
    if (column.is_protected) {
      alert("Esta coluna é protegida e não pode ser excluída.")
      return
    }

    const columnTickets = tickets.filter((t) => t.status === column.key)
    if (columnTickets.length > 0) {
      alert(
        `Não é possível excluir esta coluna pois ela contém ${columnTickets.length} chamado(s). Mova os chamados para outras colunas primeiro.`,
      )
      return
    }

    setDeletingColumn(column)
    setIsDeleteColumnOpen(true)
  }

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase.from("tickets").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setTickets(data || [])

      // Buscar telefones dos atendentes
      await fetchAttendantPhones(data || [])
    } catch (error) {
      console.error("Error fetching tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    await Promise.all([fetchTickets(), fetchColumns()])
    setLoading(false)
  }

  const fetchAttendantPhones = async (tickets: Ticket[]) => {
    try {
      const attendants = [...new Set(tickets.map((t) => t.attendant).filter(Boolean))]

      if (attendants.length > 0) {
        const { data, error } = await supabase
          .from("users")
          .select("atendente, telefone")
          .in("atendente", attendants)
          .eq("whatsapp_enabled", true)

        if (error) throw error

        const phoneMap: Record<string, string> = {}
        data?.forEach((user) => {
          if (user.telefone) {
            phoneMap[user.atendente] = user.telefone
          }
        })

        setAttendantPhones(phoneMap)
      }
    } catch (error) {
      console.error("Error fetching attendant phones:", error)
    }
  }

  const getAttendantPhone = (attendantName: string): string | undefined => {
    return attendantPhones[attendantName]
  }

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("tickets")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ticketId)

      if (error) throw error

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, status: newStatus, updated_at: new Date().toISOString() } // Removed type assertion
            : ticket,
        ),
      )
    } catch (error) {
      console.error("Error updating ticket status:", error)
    }
  }

  const handleTicketClick = (ticket: Ticket, e: React.MouseEvent) => {
    if (draggedTicket) return

    e.stopPropagation()
    setSelectedTicket(ticket)
    setIsModalOpen(true)
  }

  const handleDragStart = (e: React.DragEvent, ticketId: string) => {
    setDraggedTicket(ticketId)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", ticketId)
  }

  const handleDragEnd = () => {
    setDraggedTicket(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, columnKey: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverColumn(columnKey)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn(null)
    }
  }

  const handleDrop = async (e: React.DragEvent, columnKey: string) => {
    e.preventDefault()
    const ticketId = e.dataTransfer.getData("text/plain")

    if (ticketId && ticketId !== draggedTicket) return

    const ticket = tickets.find((t) => t.id === ticketId)
    if (!ticket || ticket.status === columnKey) {
      setDraggedTicket(null)
      setDragOverColumn(null)
      return
    }

    if (ticket.status === "resolvido") {
      setDraggedTicket(null)
      setDragOverColumn(null)
      return
    }

    if (columnKey === "resolvido") {
      setTicketToResolve(ticket)
      setIsResolveModalOpen(true)
      setDraggedTicket(null)
      setDragOverColumn(null)
      return
    }

    await updateTicketStatus(ticketId, columnKey)
    setDraggedTicket(null)
    setDragOverColumn(null)
  }

  const handleResolveConfirm = async (observation: string, sendWhatsApp: boolean) => {
    if (!ticketToResolve) return

    try {
      const { error } = await supabase
        .from("tickets")
        .update({
          status: "resolvido",
          resolved_at: new Date().toISOString(),
          resolution_observation: observation,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ticketToResolve.id)

      if (error) throw error

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketToResolve.id
            ? {
                ...ticket,
                status: "resolvido", // Removed type assertion
                resolved_at: new Date().toISOString(),
                resolution_observation: observation,
                updated_at: new Date().toISOString(),
              }
            : ticket,
        ),
      )

      // Enviar notificação WhatsApp via API server-only se solicitado
      if (sendWhatsApp && ticketToResolve.attendant) {
        try {
          const { data: attendantData } = await supabase
            .from("users")
            .select("telefone, whatsapp_enabled")
            .eq("atendente", ticketToResolve.attendant)
            .single()

          if (attendantData?.telefone && attendantData?.whatsapp_enabled) {
            await fetch("/api/whatsapp/send", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ticketId: ticketToResolve.id,
                clientEmail: ticketToResolve.client_email,
                attendantName: ticketToResolve.attendant,
                resolution: observation,
                phoneNumber: attendantData.telefone,
              }),
            })
          }
        } catch (whatsappError) {
          console.error("Error sending WhatsApp notification:", whatsappError)
        }
      }

      setIsResolveModalOpen(false)
      setTicketToResolve(null)
    } catch (error) {
      console.error("Error resolving ticket:", error)
    }
  }

  useEffect(() => {
    fetchData() // Updated to use new fetchData function
  }, [])

  const getTicketsByStatus = (status: string) => {
    return tickets.filter((ticket) => ticket.status === status)
  }

  const formatTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ptBR,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Quadro Kanban</h2>
            <Badge variant="outline" className="text-sm">
              {tickets.length} chamados
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowColumnManagement(!showColumnManagement)}
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
            >
              <Settings className="h-4 w-4" />
              Gerenciar Colunas
            </Button>
            <Button onClick={fetchData} variant="outline" size="sm" className="gap-2 bg-transparent">
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </div>

        {showColumnManagement && (
          <div className="bg-muted/50 rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Gerenciar Colunas do Kanban</h3>
              <Dialog open={isAddColumnOpen} onOpenChange={setIsAddColumnOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar Coluna
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Nova Coluna</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="column-title">Nome da Coluna</Label>
                      <Input
                        id="column-title"
                        value={newColumnTitle}
                        onChange={(e) => setNewColumnTitle(e.target.value)}
                        placeholder="Digite o nome da coluna"
                      />
                    </div>
                    <div>
                      <Label htmlFor="column-color">Cor da Coluna</Label>
                      <Select value={newColumnColor} onValueChange={setNewColumnColor}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded ${color.preview}`} />
                                {color.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddColumnOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddColumn} disabled={!newColumnTitle.trim()}>
                      Adicionar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {columns.map((column) => (
                <div key={column.id} className="bg-background rounded-lg p-3 border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{column.title}</span>
                    {!column.is_protected && (
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => openEditModal(column)}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-destructive"
                          onClick={() => openDeleteModal(column)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className={`h-8 rounded ${column.color} flex items-center justify-center text-xs`}>
                    {column.is_protected ? "Protegida" : "Customizada"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          className={`grid gap-6 min-h-[600px]`}
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(250px, 1fr))` }}
        >
          {columns.map((column) => {
            const columnTickets = getTicketsByStatus(column.key)
            const isDragOver = dragOverColumn === column.key
            const columnClasses = `rounded-lg border-2 p-4 transition-all duration-200 ${column.color} ${
              isDragOver ? "ring-2 ring-primary ring-opacity-50 scale-[1.02]" : ""
            }`

            return (
              <div
                key={column.key}
                className={columnClasses}
                onDragOver={(e) => handleDragOver(e, column.key)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.key)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm uppercase tracking-wide">{column.title}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {columnTickets.length}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {columnTickets.map((ticket) => {
                    const isDragging = draggedTicket === ticket.id
                    const cardClasses = `shadow-sm hover:shadow-md transition-all cursor-move select-none ${
                      isDragging ? "opacity-50 rotate-2 scale-95" : "hover:scale-[1.02]"
                    }`

                    return (
                      <Card
                        key={ticket.id}
                        className={cardClasses}
                        draggable={ticket.status !== "resolvido"}
                        onDragStart={(e) => handleDragStart(e, ticket.id)}
                        onDragEnd={handleDragEnd}
                        onClick={(e) => handleTicketClick(ticket, e)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 flex-1 min-w-0">
                              {ticket.status !== "resolvido" && (
                                <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                              )}
                              <CardTitle className="text-sm font-medium leading-tight line-clamp-2 flex-1">
                                {ticket.description.length > 50
                                  ? `${ticket.description.substring(0, 50)}...`
                                  : ticket.description}
                              </CardTitle>
                            </div>
                            <Badge variant="outline" className={`text-xs shrink-0 ${priorityColors[ticket.priority]}`}>
                              {ticket.priority}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-3">
                          <div className="space-y-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{ticket.client_email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3" />
                              <span className="truncate">Atendente: {ticket.attendant}</span>
                            </div>
                            {ticket.broker_link && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs">🏦</span>
                                <span className="truncate">Broker: {ticket.broker_link}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 pt-1 border-t">
                              <Calendar className="h-3 w-3" />
                              <span>{formatTimeAgo(ticket.created_at)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}

                  {columnTickets.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhum chamado</p>
                      {draggedTicket && <p className="text-xs mt-2 text-primary">Solte aqui para mover</p>}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Dialog open={isEditColumnOpen} onOpenChange={setIsEditColumnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Coluna</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-column-title">Nome da Coluna</Label>
              <Input
                id="edit-column-title"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="Digite o nome da coluna"
              />
            </div>
            <div>
              <Label htmlFor="edit-column-color">Cor da Coluna</Label>
              <Select value={newColumnColor} onValueChange={setNewColumnColor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${color.preview}`} />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditColumnOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditColumn} disabled={!newColumnTitle.trim()}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteColumnOpen} onOpenChange={setIsDeleteColumnOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Coluna</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a coluna "{deletingColumn?.title}"? Esta ação não pode ser desfeita e todos
              os chamados nesta coluna precisarão ser movidos para outras colunas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteColumn}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TicketDetailModal ticket={selectedTicket} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <ResolveTicketModal
        isOpen={isResolveModalOpen}
        onClose={() => {
          setIsResolveModalOpen(false)
          setTicketToResolve(null)
        }}
        onConfirm={handleResolveConfirm}
        ticketId={ticketToResolve?.id || ""}
        attendantPhone={ticketToResolve?.attendant ? getAttendantPhone(ticketToResolve.attendant) : undefined}
      />
    </>
  )
}
