"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertTriangle, MessageCircle } from "lucide-react"

interface ResolveTicketModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (observation: string, sendWhatsApp: boolean) => void
  ticketId: string
  attendantPhone?: string
}

export default function ResolveTicketModal({ isOpen, onClose, onConfirm, ticketId, attendantPhone }: ResolveTicketModalProps) {
  const [observation, setObservation] = useState("")
  const [sendWhatsApp, setSendWhatsApp] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    if (!observation.trim()) return

    setIsSubmitting(true)
    try {
      await onConfirm(observation.trim(), sendWhatsApp)
      setObservation("")
      setSendWhatsApp(true)
      onClose()
    } catch (error) {
      console.error("Error resolving ticket:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setObservation("")
    setSendWhatsApp(true)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Resolver Ticket
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Você deseja realmente resolver o ticket #
            {ticketId && typeof ticketId === "string" ? ticketId.slice(-8) : "N/A"}?
          </p>

          <div className="space-y-2">
            <Label htmlFor="observation" className="text-sm font-medium">
              Observação da Resolução *
            </Label>
            <Textarea
              id="observation"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Descreva como o problema foi resolvido..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Este campo é obrigatório e não poderá ser alterado após a resolução.
            </p>
          </div>

          {attendantPhone && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="whatsapp"
                  checked={sendWhatsApp}
                  onCheckedChange={(checked) => setSendWhatsApp(checked as boolean)}
                />
                <Label htmlFor="whatsapp" className="text-sm font-medium flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-green-600" />
                  Enviar notificação WhatsApp
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Enviará uma mensagem para {attendantPhone} informando sobre a resolução do chamado.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Não
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!observation.trim() || isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? "Resolvendo..." : "Sim, Resolver"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
