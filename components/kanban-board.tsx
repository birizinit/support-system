"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Clock, User, Mail, Calendar, GripVertical } from "lucide-react"
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
  status: "aberto" | "em_andamento" | "resolvido"
  client_email: string
  broker_link?: string
  attendant: string
  created_at: string
  updated_at: string
  resolved_at?: string
  resolution_observation?: string
}

const statusColumns = [
  { key: "aberto", title: "Aberto", color: "bg-red-50 border-red-200" },
  { key: "em_andamento", title: "Em Andamento", color: "bg-blue-50 border-blue-200" },
  { key: "resolvido", title: "Resolvido", color: "bg-green-50 border-green-200" },
]

const priorityColors = {
  baixa: "bg-green-100 text-green-800 border-green-200",
  media: "bg-yellow-100 text-yellow-800 border-yellow-200",
  alta: "bg-orange-100 text-orange-800 border-orange-200",
  critica: "bg-red-100 text-red-800 border-red-200",
}

export default function KanbanBoard() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedTicket, setDraggedTicket] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false)
  const [ticketToResolve, setTicketToResolve] = useState<Ticket | null>(null)
  const [attendantPhones, setAttendantPhones] = useState<Record<string, string>>({})

  const supabase = createClient()

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

  const fetchAttendantPhones = async (tickets: Ticket[]) => {
    try {
      const attendants = [...new Set(tickets.map(t => t.attendant).filter(Boolean))]
      
      if (attendants.length > 0) {
        const { data, error } = await supabase
          .from('users')
          .select('atendente, telefone')
          .in('atendente', attendants)
          .eq('whatsapp_enabled', true)

        if (error) throw error

        const phoneMap: Record<string, string> = {}
        data?.forEach(user => {
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
            ? { ...ticket, status: newStatus as Ticket["status"], updated_at: new Date().toISOString() }
            : ticket,
        ),
      )
    } catch (error) {
      console.error("Error updating ticket status:", error)
    }
  }

  const handleTicketUpdate = (updatedTicket: Ticket) => {
    setTickets((prev) => prev.map((ticket) => (ticket.id === updatedTicket.id ? updatedTicket : ticket)))
    setSelectedTicket(updatedTicket)
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
                status: "resolvido" as Ticket["status"],
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
            .from('users')
            .select('telefone, whatsapp_enabled')
            .eq('atendente', ticketToResolve.attendant)
            .single()

          if (attendantData?.telefone && attendantData?.whatsapp_enabled) {
            await fetch('/api/whatsapp/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
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
          console.error('Error sending WhatsApp notification:', whatsappError)
        }
      }

      setIsResolveModalOpen(false)
      setTicketToResolve(null)
    } catch (error) {
      console.error("Error resolving ticket:", error)
    }
  }

  useEffect(() => {
    fetchTickets()
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
          <Button onClick={fetchTickets} variant="outline" size="sm" className="gap-2 bg-transparent">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[600px]">
          {statusColumns.map((column) => {
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

      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={handleTicketUpdate}
      />

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
