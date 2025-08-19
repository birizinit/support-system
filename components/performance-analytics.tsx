"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { Trophy, Target, Clock, TrendingUp, TrendingDown, Award, AlertCircle, CheckCircle2, Star } from "lucide-react"

interface AttendantPerformance {
  name: string
  totalTickets: number
  resolvedTickets: number
  avgResolutionTime: number
  resolutionRate: number
  responseTime: number
  customerRating: number
  slaCompliance: number
  productivity: number
  quality: number
  trend: "up" | "down" | "stable"
  rank: number
}

interface PerformanceAnalyticsProps {
  ticketsByAttendant: { [key: string]: number }
  totalTickets: number
  timeFilter: string
}

export function PerformanceAnalytics({ ticketsByAttendant, totalTickets, timeFilter }: PerformanceAnalyticsProps) {
  const [selectedAttendant, setSelectedAttendant] = useState<string>("all")
  const [performanceData, setPerformanceData] = useState<AttendantPerformance[]>([])

  useEffect(() => {
    generatePerformanceData()
  }, [ticketsByAttendant, totalTickets])

  const generatePerformanceData = () => {
    const attendants = Object.entries(ticketsByAttendant)
      .filter(([name]) => name !== "Não Atribuído")
      .map(([name, tickets], index) => {
        // Simulate realistic performance metrics
        const resolvedTickets = Math.floor(tickets * (0.7 + Math.random() * 0.25))
        const resolutionRate = tickets > 0 ? (resolvedTickets / tickets) * 100 : 0
        const avgResolutionTime = 2 + Math.random() * 6 // 2-8 hours
        const responseTime = 0.5 + Math.random() * 2 // 0.5-2.5 hours
        const customerRating = 3.5 + Math.random() * 1.5 // 3.5-5.0
        const slaCompliance = 75 + Math.random() * 20 // 75-95%
        const productivity = 60 + Math.random() * 35 // 60-95%
        const quality = 70 + Math.random() * 25 // 70-95%

        // Determine trend based on performance
        let trend: "up" | "down" | "stable" = "stable"
        if (resolutionRate > 80 && customerRating > 4.2) trend = "up"
        else if (resolutionRate < 60 || customerRating < 3.8) trend = "down"

        return {
          name,
          totalTickets: tickets,
          resolvedTickets,
          avgResolutionTime,
          resolutionRate,
          responseTime,
          customerRating,
          slaCompliance,
          productivity,
          quality,
          trend,
          rank: 0, // Will be set after sorting
        }
      })
      .sort((a, b) => {
        // Rank by overall performance score
        const scoreA =
          a.resolutionRate * 0.3 + a.customerRating * 20 * 0.3 + a.slaCompliance * 0.2 + a.productivity * 0.2
        const scoreB =
          b.resolutionRate * 0.3 + b.customerRating * 20 * 0.3 + b.slaCompliance * 0.2 + b.productivity * 0.2
        return scoreB - scoreA
      })
      .map((attendant, index) => ({ ...attendant, rank: index + 1 }))

    setPerformanceData(attendants)
  }

  const getPerformanceColor = (value: number, type: "percentage" | "rating" | "time") => {
    if (type === "percentage") {
      if (value >= 80) return "text-green-600"
      if (value >= 60) return "text-yellow-600"
      return "text-red-600"
    }
    if (type === "rating") {
      if (value >= 4.5) return "text-green-600"
      if (value >= 4.0) return "text-yellow-600"
      return "text-red-600"
    }
    if (type === "time") {
      if (value <= 2) return "text-green-600"
      if (value <= 4) return "text-yellow-600"
      return "text-red-600"
    }
    return "text-gray-600"
  }

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4" />
    }
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1)
      return (
        <Badge className="bg-yellow-500 text-white">
          <Trophy className="h-3 w-3 mr-1" />
          1º
        </Badge>
      )
    if (rank === 2)
      return (
        <Badge className="bg-gray-400 text-white">
          <Award className="h-3 w-3 mr-1" />
          2º
        </Badge>
      )
    if (rank === 3)
      return (
        <Badge className="bg-amber-600 text-white">
          <Award className="h-3 w-3 mr-1" />
          3º
        </Badge>
      )
    return <Badge variant="outline">{rank}º</Badge>
  }

  const selectedAttendantData =
    selectedAttendant === "all" ? null : performanceData.find((a) => a.name === selectedAttendant)

  // Radar chart data for selected attendant
  const radarData = selectedAttendantData
    ? [
        { metric: "Resolução", value: selectedAttendantData.resolutionRate },
        { metric: "Qualidade", value: selectedAttendantData.quality },
        { metric: "SLA", value: selectedAttendantData.slaCompliance },
        { metric: "Produtividade", value: selectedAttendantData.productivity },
        { metric: "Satisfação", value: selectedAttendantData.customerRating * 20 },
      ]
    : []

  const chartConfig = {
    performance: {
      label: "Performance",
      color: "hsl(var(--chart-1))",
    },
    resolutionRate: {
      label: "Taxa de Resolução",
      color: "hsl(var(--chart-2))",
    },
    productivity: {
      label: "Produtividade",
      color: "hsl(var(--chart-3))",
    },
  }

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Melhor Performance</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceData[0]?.name || "N/A"}</div>
            <p className="text-xs text-muted-foreground">
              {performanceData[0]?.resolutionRate.toFixed(1)}% de resolução
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média de SLA</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceData.length > 0
                ? (performanceData.reduce((sum, a) => sum + a.slaCompliance, 0) / performanceData.length).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Compliance médio da equipe</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceData.length > 0
                ? (performanceData.reduce((sum, a) => sum + a.avgResolutionTime, 0) / performanceData.length).toFixed(1)
                : 0}
              h
            </div>
            <p className="text-xs text-muted-foreground">Resolução média da equipe</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfação Média</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceData.length > 0
                ? (performanceData.reduce((sum, a) => sum + a.customerRating, 0) / performanceData.length).toFixed(1)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">Avaliação média (1-5)</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendant Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Análise Individual</CardTitle>
          <CardDescription>Selecione um atendente para análise detalhada</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedAttendant} onValueChange={setSelectedAttendant}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Visão Geral</SelectItem>
              {performanceData.map((attendant) => (
                <SelectItem key={attendant.name} value={attendant.name}>
                  {attendant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedAttendantData ? (
        /* Individual Performance Analysis */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Performance de {selectedAttendantData.name}
                {getRankBadge(selectedAttendantData.rank)}
                {getTrendIcon(selectedAttendantData.trend)}
              </CardTitle>
              <CardDescription>Métricas detalhadas de performance individual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium">Taxa de Resolução</div>
                  <div
                    className={`text-2xl font-bold ${getPerformanceColor(selectedAttendantData.resolutionRate, "percentage")}`}
                  >
                    {selectedAttendantData.resolutionRate.toFixed(1)}%
                  </div>
                  <Progress value={selectedAttendantData.resolutionRate} className="mt-2" />
                </div>
                <div>
                  <div className="text-sm font-medium">SLA Compliance</div>
                  <div
                    className={`text-2xl font-bold ${getPerformanceColor(selectedAttendantData.slaCompliance, "percentage")}`}
                  >
                    {selectedAttendantData.slaCompliance.toFixed(1)}%
                  </div>
                  <Progress value={selectedAttendantData.slaCompliance} className="mt-2" />
                </div>
                <div>
                  <div className="text-sm font-medium">Tempo Médio</div>
                  <div
                    className={`text-2xl font-bold ${getPerformanceColor(selectedAttendantData.avgResolutionTime, "time")}`}
                  >
                    {selectedAttendantData.avgResolutionTime.toFixed(1)}h
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Satisfação</div>
                  <div
                    className={`text-2xl font-bold ${getPerformanceColor(selectedAttendantData.customerRating, "rating")}`}
                  >
                    {selectedAttendantData.customerRating.toFixed(1)}/5
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Radar de Competências</CardTitle>
              <CardDescription>Análise multidimensional de performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" className="text-xs" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} className="text-xs" tick={false} />
                    <Radar
                      name="Performance"
                      dataKey="value"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Team Performance Comparison */
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Performance</CardTitle>
              <CardDescription>Comparação de performance entre todos os atendentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.map((attendant) => (
                  <div key={attendant.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getRankBadge(attendant.rank)}
                      <div>
                        <div className="font-medium">{attendant.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {attendant.totalTickets} tickets • {attendant.resolutionRate.toFixed(1)}% resolução
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">SLA: {attendant.slaCompliance.toFixed(1)}%</div>
                        <div className="text-sm text-muted-foreground">⭐ {attendant.customerRating.toFixed(1)}</div>
                      </div>
                      {getTrendIcon(attendant.trend)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comparação de Métricas</CardTitle>
              <CardDescription>Performance comparativa por atendente</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 12 }} />
                    <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="resolutionRate"
                      name="Taxa de Resolução (%)"
                      fill="hsl(var(--chart-1))"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar
                      dataKey="slaCompliance"
                      name="SLA Compliance (%)"
                      fill="hsl(var(--chart-2))"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Alertas de Performance
          </CardTitle>
          <CardDescription>Indicadores que requerem atenção</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {performanceData
              .filter((a) => a.resolutionRate < 70 || a.slaCompliance < 80 || a.customerRating < 4.0)
              .map((attendant) => (
                <div
                  key={attendant.name}
                  className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg"
                >
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <div className="flex-1">
                    <div className="font-medium">{attendant.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {attendant.resolutionRate < 70 && "Taxa de resolução baixa • "}
                      {attendant.slaCompliance < 80 && "SLA abaixo do esperado • "}
                      {attendant.customerRating < 4.0 && "Satisfação do cliente baixa"}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Revisar
                  </Button>
                </div>
              ))}
            {performanceData.filter((a) => a.resolutionRate >= 70 && a.slaCompliance >= 80 && a.customerRating >= 4.0)
              .length === performanceData.length && (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <div className="text-sm text-green-700">
                  Todos os atendentes estão dentro dos parâmetros esperados de performance.
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
