"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts"

interface AnalyticsChartsProps {
  ticketsByPriority: { [key: string]: number }
  ticketsByStatus: { [key: string]: number }
  ticketsByAttendant: { [key: string]: number }
  dailyTrends: { date: string; tickets: number; resolved: number }[]
  totalTickets: number
}

export function AnalyticsCharts({
  ticketsByPriority,
  ticketsByStatus,
  ticketsByAttendant,
  dailyTrends,
  totalTickets,
}: AnalyticsChartsProps) {
  // Prepare data for priority pie chart
  const priorityData = Object.entries(ticketsByPriority).map(([priority, count]) => ({
    name: priority.charAt(0).toUpperCase() + priority.slice(1),
    value: count,
    percentage: totalTickets > 0 ? ((count / totalTickets) * 100).toFixed(1) : "0",
  }))

  // Prepare data for status pie chart
  const statusData = Object.entries(ticketsByStatus).map(([status, count]) => ({
    name: status.replace("_", " ").charAt(0).toUpperCase() + status.replace("_", " ").slice(1),
    value: count,
    percentage: totalTickets > 0 ? ((count / totalTickets) * 100).toFixed(1) : "0",
  }))

  // Prepare data for attendant bar chart
  const attendantData = Object.entries(ticketsByAttendant)
    .map(([attendant, count]) => ({
      name: attendant,
      tickets: count,
      resolved: Math.floor(count * 0.7), // Simulated resolved count
      pending: Math.floor(count * 0.3), // Simulated pending count
    }))
    .sort((a, b) => b.tickets - a.tickets)

  // Enhanced daily trends with cumulative data
  const enhancedDailyTrends = dailyTrends.map((day, index) => {
    const cumulative = dailyTrends.slice(0, index + 1).reduce((sum, d) => sum + d.tickets, 0)
    return {
      ...day,
      cumulative,
      efficiency: day.tickets > 0 ? ((day.resolved / day.tickets) * 100).toFixed(1) : "0",
    }
  })

  // Color schemes
  const priorityColors = {
    Alta: "#ef4444", // red-500
    Media: "#f59e0b", // amber-500
    Baixa: "#10b981", // emerald-500
  }

  const statusColors = {
    Aberto: "hsl(var(--chart-1))",
    "Em andamento": "hsl(var(--chart-3))",
    Aguardando: "hsl(var(--chart-4))",
    Resolvido: "hsl(var(--chart-2))",
    Fechado: "#6b7280",
  }

  const chartConfig = {
    tickets: {
      label: "Tickets",
      color: "hsl(var(--chart-1))",
    },
    resolved: {
      label: "Resolvidos",
      color: "hsl(var(--chart-2))",
    },
    pending: {
      label: "Pendentes",
      color: "hsl(var(--chart-3))",
    },
    cumulative: {
      label: "Acumulado",
      color: "hsl(var(--chart-4))",
    },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Priority Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Prioridade</CardTitle>
          <CardDescription>Proporção de tickets por nível de prioridade</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell
                      key={`priority-${index}`}
                      fill={priorityColors[entry.name as keyof typeof priorityColors] || "#6b7280"}
                    />
                  ))}
                </Pie>
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-background border rounded-lg shadow-lg p-3">
                          <p className="font-medium">{data.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {data.value} tickets ({data.percentage}%)
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="flex flex-wrap gap-2 mt-4">
            {priorityData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: priorityColors[item.name as keyof typeof priorityColors] || "#6b7280" }}
                />
                <span className="text-sm">
                  {item.name}: {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Status</CardTitle>
          <CardDescription>Proporção de tickets por status atual</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`status-${index}`}
                      fill={statusColors[entry.name as keyof typeof statusColors] || "#6b7280"}
                    />
                  ))}
                </Pie>
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-background border rounded-lg shadow-lg p-3">
                          <p className="font-medium">{data.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {data.value} tickets ({data.percentage}%)
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="flex flex-wrap gap-2 mt-4">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: statusColors[item.name as keyof typeof statusColors] || "#6b7280" }}
                />
                <span className="text-sm">
                  {item.name}: {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Attendant Performance Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance por Atendente</CardTitle>
          <CardDescription>Comparação de tickets atribuídos e resolvidos</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendantData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 12 }} />
                <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="tickets" name="Total" fill="hsl(var(--chart-1))" radius={[2, 2, 0, 0]} />
                <Bar dataKey="resolved" name="Resolvidos" fill="hsl(var(--chart-2))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Daily Trends Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Tendências Temporais</CardTitle>
          <CardDescription>Evolução diária de tickets criados e resolvidos</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enhancedDailyTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 12 }} />
                <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg shadow-lg p-3">
                          <p className="font-medium mb-2">{label}</p>
                          {payload.map((entry, index) => (
                            <p key={index} className="text-sm" style={{ color: entry.color }}>
                              {entry.name}: {entry.value}
                            </p>
                          ))}
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  type="monotone"
                  dataKey="tickets"
                  name="Criados"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  name="Resolvidos"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Cumulative Area Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Volume Acumulado de Tickets</CardTitle>
          <CardDescription>Crescimento acumulativo do volume de tickets ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enhancedDailyTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="ticketsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 12 }} />
                <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-background border rounded-lg shadow-lg p-3">
                          <p className="font-medium mb-2">{label}</p>
                          <p className="text-sm">Criados no dia: {data.tickets}</p>
                          <p className="text-sm">Resolvidos no dia: {data.resolved}</p>
                          <p className="text-sm">Total acumulado: {data.cumulative}</p>
                          <p className="text-sm">Eficiência: {data.efficiency}%</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="tickets"
                  stackId="1"
                  stroke="hsl(var(--chart-1))"
                  fill="url(#ticketsGradient)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stackId="2"
                  stroke="hsl(var(--chart-2))"
                  fill="url(#resolvedGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Efficiency Metrics */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Métricas de Eficiência</CardTitle>
          <CardDescription>Indicadores de performance e produtividade da equipe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {totalTickets > 0
                  ? (
                      ((Object.values(ticketsByStatus).find(
                        (_, i) => Object.keys(ticketsByStatus)[i] === "resolvido",
                      ) || 0) /
                        totalTickets) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </div>
              <div className="text-sm text-muted-foreground">Taxa de Resolução</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-accent">
                {attendantData.length > 0
                  ? (attendantData.reduce((sum, a) => sum + a.tickets, 0) / attendantData.length).toFixed(1)
                  : 0}
              </div>
              <div className="text-sm text-muted-foreground">Tickets por Atendente</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-chart-3">
                {enhancedDailyTrends.length > 0
                  ? (
                      enhancedDailyTrends.reduce((sum, d) => sum + Number.parseFloat(d.efficiency), 0) /
                      enhancedDailyTrends.length
                    ).toFixed(1)
                  : 0}
                %
              </div>
              <div className="text-sm text-muted-foreground">Eficiência Média</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-chart-4">
                {dailyTrends.length > 0
                  ? (dailyTrends.reduce((sum, d) => sum + d.tickets, 0) / dailyTrends.length).toFixed(1)
                  : 0}
              </div>
              <div className="text-sm text-muted-foreground">Tickets por Dia</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
