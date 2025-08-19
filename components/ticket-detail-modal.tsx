"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, X, Mail, Calendar, Clock, UserCheck, Edit3 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { formatDistanceToNow, format } from "date-fns"
import { ptBR } from "date-fns/locale"

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

interface TicketDetailModalProps {
  ticket: Ticket | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedTicket: Ticket) => void
}

const priorityColors = {
  baixa: "bg-green-100 text-green-800 border-green-200",
  media: "bg-yellow-100 text-yellow-800 border-yellow-200",
  alta: "bg-orange-100 text-orange-800 border-orange-200",
  critica: "bg-red-100 text-red-800 border-red-200",
}

const statusOptions = [
  { value: "aberto", label: "Aberto" },
  { value: "em_andamento", label: "Em Andamento" },
  { value: "resolvido", label: "Resolvido" },
]

const priorityOptions = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
  { value: "critica", label: "Crítica" },
]

const categoryOptions = ["Hardware", "Software", "Rede", "Acesso", "Performance", "Infraestrutura", "Outros"]

const attendantOptions = ["Thiago", "Gabriel", "Carlos", "Vitor"]

export default function TicketDetailModal({ ticket, isOpen, onClose, onUpdate }: TicketDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedTicket, setEditedTicket] = useState<Ticket | null>(null)

  useEffect(() => {
    if (ticket) {
      setEditedTicket({ ...ticket })
    }
  }, [ticket])

  const handleSave = async () => {
    if (!editedTicket) return

    setIsSaving(true)
    try {
      const updateData: any = {
        description: editedTicket.description,
        priority: editedTicket.priority,
        status: editedTicket.status,
        attendant: editedTicket.attendant, // using attendant instead of assigned_to
        updated_at: new Date().toISOString(),
      }

      // Set resolved_at if status is being changed to resolved
      if (editedTicket.status === "resolvido" && ticket?.status !== "resolvido") {
        updateData.resolved_at = new Date().toISOString()
      } else if (editedTicket.status !== "resolvido") {
        updateData.resolved_at = null
      }

      const { error } = await supabase.from("tickets").update(updateData).eq("id", editedTicket.id)

      if (error) throw error

      onUpdate({ ...editedTicket, ...updateData })
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating ticket:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (ticket) {
      setEditedTicket({ ...ticket })
    }
    setIsEditing(false)
  }

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  }

  const formatTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ptBR,
    })
  }

  if (!ticket || !editedTicket) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Chamado #{ticket.id.slice(-8)}</DialogTitle>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={isSaving} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Salvando..." : "Salvar"}
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Descrição do Problema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  {isEditing ? (
                    <Textarea
                      id="description"
                      value={editedTicket.description}
                      onChange={(e) => setEditedTicket({ ...editedTicket, description: e.target.value })}
                      rows={6}
                      className="min-h-[120px]"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 p-4 rounded-md">
                      {ticket.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Status and Priority */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status e Prioridade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    {isEditing ? (
                      <Select
                        value={editedTicket.status}
                        onValueChange={(value) =>
                          setEditedTicket({ ...editedTicket, status: value as Ticket["status"] })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline" className="w-fit">
                        {statusOptions.find((s) => s.value === ticket.status)?.label}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Prioridade</Label>
                    {isEditing ? (
                      <Select
                        value={editedTicket.priority}
                        onValueChange={(value) =>
                          setEditedTicket({ ...editedTicket, priority: value as Ticket["priority"] })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline" className={priorityColors[ticket.priority]}>
                        {priorityOptions.find((p) => p.value === ticket.priority)?.label}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Requester Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Solicitante</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email do Cliente</p>
                    <span className="text-sm font-medium">{ticket.client_email}</span>
                  </div>
                </div>

                {ticket.broker_link && (
                  <div className="flex items-start gap-2">
                    <span className="text-sm">🔗</span>
                    <div>
                      <p className="text-xs text-muted-foreground">Link do Broker</p>
                      <a
                        href={ticket.broker_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                      >
                        {ticket.broker_link}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Atendente</p>
                    {isEditing ? (
                      <Select
                        value={editedTicket.attendant}
                        onValueChange={(value) => setEditedTicket({ ...editedTicket, attendant: value })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um atendente" />
                        </SelectTrigger>
                        <SelectContent>
                          {attendantOptions.map((attendant) => (
                            <SelectItem key={attendant} value={attendant}>
                              {attendant}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-sm font-medium">{ticket.attendant}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Criado</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(ticket.created_at)}</p>
                    <p className="text-xs text-muted-foreground">{formatTimeAgo(ticket.created_at)}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Última atualização</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(ticket.updated_at)}</p>
                    <p className="text-xs text-muted-foreground">{formatTimeAgo(ticket.updated_at)}</p>
                  </div>
                </div>

                {ticket.resolved_at && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-600">Resolvido</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(ticket.resolved_at)}</p>
                        <p className="text-xs text-muted-foreground">{formatTimeAgo(ticket.resolved_at)}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
