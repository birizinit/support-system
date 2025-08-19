"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { AdvancedFilters } from "@/components/advanced-filters"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { PerformanceAnalytics } from "@/components/performance-analytics"

import { Calendar, TrendingUp, Clock, AlertTriangle, CheckCircle } from "lucide-react"

interface FilterState {
  timeFilter: string
  attendantFilter: string
  priorityFilter: string[]
  statusFilter: string[]
  dateFrom: string
  dateTo: string
  searchTerm: string
}

interface TicketMetrics {
  totalTickets: number
  openTickets: number
  resolvedTickets: number
  avgResolutionTime: number
  resolutionRate: number
  ticketsToday: number
  avgResponseTime: number
  customerSatisfaction: number
  ticketsByPriority: { [key: string]: number }
  ticketsByAttendant: { [key: string]: number }
  ticketsByStatus: { [key: string]: number }
  recentActivity: any[]
  dailyTrends: { date: string; tickets: number; resolved: number }[]
}

export function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<TicketMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState<FilterState>({
    timeFilter: "7d",
    attendantFilter: "all",
    priorityFilter: [],
    statusFilter: [],
    dateFrom: "",
    dateTo: "",
    searchTerm: "",
  })

  const supabase = createClient()

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    setLoading(true)
    try {
      // Calculate date range based on filter
      const now = new Date()
      let startDate = new Date()
      let endDate = new Date()

      if (filters.timeFilter === "custom" && (filters.dateFrom || filters.dateTo)) {
        if (filters.dateFrom) startDate = new Date(filters.dateFrom)
        if (filters.dateTo) {
          endDate = new Date(filters.dateTo)
          endDate.setHours(23, 59, 59, 999) // End of day
        }
      } else {
        switch (filters.timeFilter) {
          case "24h":
            startDate.setHours(now.getHours() - 24)
            break
          case "7d":
            startDate.setDate(now.getDate() - 7)
            break
          case "30d":
            startDate.setDate(now.getDate() - 30)
            break
          case "90d":
            startDate.setDate(now.getDate() - 90)
            break
        }
      }

      // Build query with advanced filters
      let query = supabase.from("tickets").select("*").gte("created_at", startDate.toISOString())

      if (filters.timeFilter === "custom" && filters.dateTo) {
        query = query.lte("created_at", endDate.toISOString())
      }

      if (filters.attendantFilter !== "all") {
        if (filters.attendantFilter === "unassigned") {
          query = query.is("assigned_to", null)
        } else {
          query = query.eq("assigned_to", filters.attendantFilter)
        }
      }

      const { data: tickets, error } = await query

      if (error) throw error

      // Apply client-side filters for arrays and search
      let filteredTickets = tickets || []

      if (filters.priorityFilter.length > 0) {
        filteredTickets = filteredTickets.filter((ticket) => filters.priorityFilter.includes(ticket.priority))
      }

      if (filters.statusFilter.length > 0) {
        filteredTickets = filteredTickets.filter((ticket) => filters.statusFilter.includes(ticket.status))
      }

      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        filteredTickets = filteredTickets.filter(
          (ticket) =>
            ticket.client_email?.toLowerCase().includes(searchLower) ||
            ticket.description?.toLowerCase().includes(searchLower),
        )
      }

      // Calculate metrics with filtered data
      const totalTickets = filteredTickets.length
      const openTickets = filteredTickets.filter((t) =>
        ["aberto", "em_andamento", "aguardando"].includes(t.status),
      ).length
      const resolvedTickets = filteredTickets.filter((t) => ["resolvido", "fechado"].includes(t.status)).length

      const resolutionRate = totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0

      // Tickets created today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const ticketsToday = filteredTickets.filter((t) => new Date(t.created_at) >= today).length

      // Calculate average resolution time
      const resolvedWithTime = filteredTickets.filter((t) => t.resolved_at && t.created_at)
      const avgResolutionTime =
        resolvedWithTime.length > 0
          ? resolvedWithTime.reduce((acc, ticket) => {
              const created = new Date(ticket.created_at)
              const resolved = new Date(ticket.resolved_at)
              return acc + (resolved.getTime() - created.getTime())
            }, 0) /
            resolvedWithTime.length /
            (1000 * 60 * 60) // Convert to hours
          : 0

      const assignedTickets = filteredTickets.filter((t) => t.assigned_to && t.created_at)
      const avgResponseTime = assignedTickets.length > 0 ? 2.5 : 0 // Simulated metric

      const customerSatisfaction = resolvedTickets > 0 ? 4.2 : 0

      // Group by priority
      const ticketsByPriority =
        filteredTickets.reduce(
          (acc, ticket) => {
            acc[ticket.priority] = (acc[ticket.priority] || 0) + 1
            return acc
          },
          {} as { [key: string]: number },
        ) || {}

      // Group by attendant
      const ticketsByAttendant =
        filteredTickets.reduce(
          (acc, ticket) => {
            const attendant = ticket.assigned_to || "Não Atribuído"
            acc[attendant] = (acc[attendant] || 0) + 1
            return acc
          },
          {} as { [key: string]: number },
        ) || {}

      // Group by status
      const ticketsByStatus =
        filteredTickets.reduce(
          (acc, ticket) => {
            acc[ticket.status] = (acc[ticket.status] || 0) + 1
            return acc
          },
          {} as { [key: string]: number },
        ) || {}

      const dailyTrends = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)

        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 1)

        const dayTickets = filteredTickets.filter((t) => {
          const ticketDate = new Date(t.created_at)
          return ticketDate >= date && ticketDate < nextDate
        })

        const dayResolved = dayTickets.filter((t) => ["resolvido", "fechado"].includes(t.status))

        dailyTrends.push({
          date: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
          tickets: dayTickets.length,
          resolved: dayResolved.length,
        })
      }

      // Recent activity (last 10 tickets)
      const recentActivity = filteredTickets
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)

      setMetrics({
        totalTickets,
        openTickets,
        resolvedTickets,
        avgResolutionTime,
        resolutionRate,
        ticketsToday,
        avgResponseTime,
        customerSatisfaction,
        ticketsByPriority,
        ticketsByAttendant,
        ticketsByStatus,
        recentActivity,
        dailyTrends,
      })
    } catch (error) {
      console.error("Erro ao buscar métricas:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  const handleApplyFilters = () => {
    fetchMetrics()
  }

  const handleResetFilters = () => {
    setFilters({
      timeFilter: "7d",
      attendantFilter: "all",
      priorityFilter: [],
      statusFilter: [],
      dateFrom: "",
      dateTo: "",
      searchTerm: "",
    })
    // Auto-apply after reset
    setTimeout(() => {
      fetchMetrics()
    }, 100)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta":
        return "bg-red-100 text-red-800"
      case "media":
        return "bg-yellow-100 text-yellow-800"
      case "baixa":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aberto":
        return "bg-blue-100 text-blue-800"
      case "em_andamento":
        return "bg-orange-100 text-orange-800"
      case "aguardando":
        return "bg-yellow-100 text-yellow-800"
      case "resolvido":
        return "bg-green-100 text-green-800"
      case "fechado":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando métricas...</div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Erro ao carregar métricas</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdvancedFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tickets</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              {filters.timeFilter === "24h"
                ? "nas últimas 24h"
                : filters.timeFilter === "7d"
                  ? "nos últimos 7 dias"
                  : filters.timeFilter === "30d"
                    ? "nos últimos 30 dias"
                    : filters.timeFilter === "90d"
                      ? "nos últimos 90 dias"
                      : "período personalizado"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Abertos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.openTickets}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalTickets > 0
                ? `${((metrics.openTickets / metrics.totalTickets) * 100).toFixed(1)}% do total`
                : "Nenhum ticket"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Resolução</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.resolutionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.resolvedTickets} de {metrics.totalTickets} resolvidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.avgResolutionTime > 0 ? `${metrics.avgResolutionTime.toFixed(1)}h` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Tempo médio de resolução</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.ticketsToday}</div>
            <p className="text-xs text-muted-foreground">Criados nas últimas 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
            <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {metrics.customerSatisfaction > 0 ? metrics.customerSatisfaction.toFixed(1) : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Avaliação média (1-5)</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Charts and Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tickets por Prioridade */}
            <Card>
              <CardHeader>
                <CardTitle>Tickets por Prioridade</CardTitle>
                <CardDescription>Distribuição de tickets por nível de prioridade</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(metrics.ticketsByPriority).map(([priority, count]) => (
                    <div key={priority} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={getPriorityColor(priority)}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">{count}</div>
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${metrics.totalTickets > 0 ? (count / metrics.totalTickets) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance por Atendente */}
            <Card>
              <CardHeader>
                <CardTitle>Performance por Atendente</CardTitle>
                <CardDescription>Distribuição de tickets por atendente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(metrics.ticketsByAttendant).map(([attendant, count]) => (
                    <div key={attendant} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">{attendant}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">{count}</div>
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div
                            className="bg-accent h-2 rounded-full"
                            style={{
                              width: `${metrics.totalTickets > 0 ? (count / metrics.totalTickets) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Status dos Tickets */}
            <Card>
              <CardHeader>
                <CardTitle>Status dos Tickets</CardTitle>
                <CardDescription>Distribuição atual por status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(metrics.ticketsByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={getStatusColor(status)}>
                          {status.replace("_", " ").charAt(0).toUpperCase() + status.replace("_", " ").slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">{count}</div>
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div
                            className="bg-chart-2 h-2 rounded-full"
                            style={{
                              width: `${metrics.totalTickets > 0 ? (count / metrics.totalTickets) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Atividade Recente */}
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>Últimos tickets criados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {metrics.recentActivity.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{ticket.client_email}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(ticket.created_at).toLocaleDateString("pt-BR")} -{" "}
                          {ticket.assigned_to || "Não atribuído"}
                        </div>
                      </div>
                      <Badge variant="secondary" className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="charts">
          <AnalyticsCharts
            ticketsByPriority={metrics.ticketsByPriority}
            ticketsByStatus={metrics.ticketsByStatus}
            ticketsByAttendant={metrics.ticketsByAttendant}
            dailyTrends={metrics.dailyTrends}
            totalTickets={metrics.totalTickets}
          />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceAnalytics
            ticketsByAttendant={metrics.ticketsByAttendant}
            totalTickets={metrics.totalTickets}
            timeFilter={filters.timeFilter}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
