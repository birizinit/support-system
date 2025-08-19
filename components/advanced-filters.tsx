"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Filter, X, RotateCcw, Search } from "lucide-react"

interface FilterState {
  timeFilter: string
  attendantFilter: string
  priorityFilter: string[]
  statusFilter: string[]
  dateFrom: string
  dateTo: string
  searchTerm: string
}

interface AdvancedFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onApplyFilters: () => void
  onResetFilters: () => void
}

export function AdvancedFilters({ filters, onFiltersChange, onApplyFilters, onResetFilters }: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const toggleArrayFilter = (key: "priorityFilter" | "statusFilter", value: string) => {
    const currentArray = filters[key]
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value]
    updateFilter(key, newArray)
  }

  const removeArrayFilter = (key: "priorityFilter" | "statusFilter", value: string) => {
    const newArray = filters[key].filter((item) => item !== value)
    updateFilter(key, newArray)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.attendantFilter !== "all") count++
    if (filters.priorityFilter.length > 0) count++
    if (filters.statusFilter.length > 0) count++
    if (filters.dateFrom || filters.dateTo) count++
    if (filters.searchTerm) count++
    return count
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "media":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "baixa":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aberto":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "em_andamento":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200"
      case "aguardando":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "resolvido":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "fechado":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros Avançados
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Configure filtros personalizados para análise detalhada</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? "Recolher" : "Expandir"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Filters Row */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={filters.timeFilter} onValueChange={(value) => updateFilter("timeFilter", value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Últimas 24h</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
                <SelectItem value="custom">Período personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por email..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter("searchTerm", e.target.value)}
              className="w-[200px]"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={onApplyFilters} size="sm">
              Aplicar
            </Button>
            <Button onClick={onResetFilters} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          </div>
        </div>

        {/* Custom Date Range */}
        {filters.timeFilter === "custom" && (
          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">De:</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter("dateFrom", e.target.value)}
                className="w-[150px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Até:</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter("dateTo", e.target.value)}
                className="w-[150px]"
              />
            </div>
          </div>
        )}

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-6 pt-4 border-t">
            {/* Attendant Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Atendente</label>
              <Select value={filters.attendantFilter} onValueChange={(value) => updateFilter("attendantFilter", value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os atendentes</SelectItem>
                  <SelectItem value="Thiago">Thiago</SelectItem>
                  <SelectItem value="Gabriel">Gabriel</SelectItem>
                  <SelectItem value="Carlos">Carlos</SelectItem>
                  <SelectItem value="Vitor">Vitor</SelectItem>
                  <SelectItem value="unassigned">Não atribuído</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Prioridade</label>
              <div className="flex flex-wrap gap-2">
                {["alta", "media", "baixa"].map((priority) => (
                  <Badge
                    key={priority}
                    variant={filters.priorityFilter.includes(priority) ? "default" : "secondary"}
                    className={`cursor-pointer transition-colors ${
                      filters.priorityFilter.includes(priority)
                        ? "bg-primary text-primary-foreground"
                        : getPriorityColor(priority)
                    }`}
                    onClick={() => toggleArrayFilter("priorityFilter", priority)}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    {filters.priorityFilter.includes(priority) && (
                      <X
                        className="h-3 w-3 ml-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeArrayFilter("priorityFilter", priority)
                        }}
                      />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <div className="flex flex-wrap gap-2">
                {["aberto", "em_andamento", "aguardando", "resolvido", "fechado"].map((status) => (
                  <Badge
                    key={status}
                    variant={filters.statusFilter.includes(status) ? "default" : "secondary"}
                    className={`cursor-pointer transition-colors ${
                      filters.statusFilter.includes(status)
                        ? "bg-primary text-primary-foreground"
                        : getStatusColor(status)
                    }`}
                    onClick={() => toggleArrayFilter("statusFilter", status)}
                  >
                    {status.replace("_", " ").charAt(0).toUpperCase() + status.replace("_", " ").slice(1)}
                    {filters.statusFilter.includes(status) && (
                      <X
                        className="h-3 w-3 ml-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeArrayFilter("statusFilter", status)
                        }}
                      />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Active Filters Summary */}
            {getActiveFiltersCount() > 0 && (
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-primary">Filtros Ativos</h4>
                  <Button onClick={onResetFilters} variant="ghost" size="sm" className="text-primary">
                    Limpar todos
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filters.attendantFilter !== "all" && (
                    <Badge variant="outline" className="border-primary/50">
                      Atendente: {filters.attendantFilter}
                    </Badge>
                  )}
                  {filters.priorityFilter.map((priority) => (
                    <Badge key={priority} variant="outline" className="border-primary/50">
                      Prioridade: {priority}
                    </Badge>
                  ))}
                  {filters.statusFilter.map((status) => (
                    <Badge key={status} variant="outline" className="border-primary/50">
                      Status: {status.replace("_", " ")}
                    </Badge>
                  ))}
                  {(filters.dateFrom || filters.dateTo) && (
                    <Badge variant="outline" className="border-primary/50">
                      Período: {filters.dateFrom || "..."} até {filters.dateTo || "..."}
                    </Badge>
                  )}
                  {filters.searchTerm && (
                    <Badge variant="outline" className="border-primary/50">
                      Busca: "{filters.searchTerm}"
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
