"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

interface FormData {
  clientEmail: string
  brokerLink: string
  attendant: string
  description: string
  priority: string
}

interface Attendant {
  id: string
  atendente: string
  username: string
}

export default function Level1Form() {
  const [formData, setFormData] = useState<FormData>({
    clientEmail: "",
    brokerLink: "",
    attendant: "",
    description: "",
    priority: "",
  })

  const [attendants, setAttendants] = useState<Attendant[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    fetchAttendants()
  }, [])

  const fetchAttendants = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, atendente, username')
        .eq('is_active', true)
        .eq('level1_access', true)
        .order('atendente')

      if (error) throw error
      setAttendants(data || [])
    } catch (error) {
      console.error('Erro ao buscar atendentes:', error)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      const { error } = await supabase.from("tickets").insert([
        {
          client_email: formData.clientEmail,
          broker_link: formData.brokerLink,
          attendant: formData.attendant,
          description: formData.description,
          priority: formData.priority,
          status: "aberto",
        },
      ])

      if (error) {
        throw error
      }

      setSubmitStatus("success")
      setFormData({
        clientEmail: "",
        brokerLink: "",
        attendant: "",
        description: "",
        priority: "",
      })
    } catch (error: any) {
      setSubmitStatus("error")
      setErrorMessage(error.message || "Erro ao criar chamado")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full shadow-sm border-border">
      <CardHeader className="pb-6">
        <CardTitle className="text-lg font-semibold text-center">Novo Chamado de Suporte</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {submitStatus === "success" && (
            <div className="flex items-center gap-2 p-3 bg-accent/10 border border-accent/20 rounded-lg text-accent">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Chamado criado com sucesso!</span>
            </div>
          )}

          {submitStatus === "error" && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{errorMessage}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientEmail" className="text-sm font-medium">
                Email do Cliente *
              </Label>
              <Input
                id="clientEmail"
                type="email"
                value={formData.clientEmail}
                onChange={(e) => handleInputChange("clientEmail", e.target.value)}
                placeholder="cliente@email.com"
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brokerLink" className="text-sm font-medium">
                Link do Broker
              </Label>
              <Input
                id="brokerLink"
                type="url"
                value={formData.brokerLink}
                onChange={(e) => handleInputChange("brokerLink", e.target.value)}
                placeholder="https://broker.exemplo.com"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attendant" className="text-sm font-medium">
                Atendente *
              </Label>
              <Select value={formData.attendant} onValueChange={(value) => handleInputChange("attendant", value)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Selecione o atendente" />
                </SelectTrigger>
                <SelectContent>
                  {attendants.map((attendant) => (
                    <SelectItem key={attendant.id} value={attendant.atendente}>
                      {attendant.atendente}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Descrição do Problema *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Descreva o problema em detalhes..."
                required
                rows={6}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-medium">
                Prioridade *
              </Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-base font-medium">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando Chamado...
              </>
            ) : (
              "Criar Chamado"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
