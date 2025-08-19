"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Plus, Edit, Trash2, Save, X, Eye, EyeOff, MessageCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { hashPassword } from "@/lib/auth-utils"

interface User {
  id: string
  atendente: string
  telefone: string
  username: string
  level1_access: boolean
  level2_access: boolean
  level3_access: boolean
  is_active: boolean
  whatsapp_enabled: boolean
  created_at: string
}

interface UserForm {
  atendente: string
  telefone: string
  username: string
  password: string
  level1_access: boolean
  level2_access: boolean
  level3_access: boolean
  whatsapp_enabled: boolean
}

export default function UserManagement() {
  const supabase = createClient()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<UserForm>({
    atendente: "",
    telefone: "",
    username: "",
    password: "",
    level1_access: false,
    level2_access: false,
    level3_access: false,
    whatsapp_enabled: true,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      setError('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const hashedPassword = await hashPassword(formData.password)
      
      if (editingUser) {
        // Atualizar usuário existente
        const { error } = await supabase
          .from('users')
          .update({
            atendente: formData.atendente,
            telefone: formData.telefone,
            username: formData.username,
            password_hash: hashedPassword,
            level1_access: formData.level1_access,
            level2_access: formData.level2_access,
            level3_access: formData.level3_access,
            whatsapp_enabled: formData.whatsapp_enabled,
          })
          .eq('id', editingUser.id)

        if (error) throw error
        setSuccess('Usuário atualizado com sucesso!')
      } else {
        // Criar novo usuário
        const { error } = await supabase
          .from('users')
          .insert([{
            atendente: formData.atendente,
            telefone: formData.telefone,
            username: formData.username,
            password_hash: hashedPassword,
            level1_access: formData.level1_access,
            level2_access: formData.level2_access,
            level3_access: formData.level3_access,
            whatsapp_enabled: formData.whatsapp_enabled,
          }])

        if (error) throw error
        setSuccess('Usuário criado com sucesso!')
      }

      resetForm()
      fetchUsers()
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error)
      setError(error.message || 'Erro ao salvar usuário')
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      atendente: user.atendente,
      telefone: user.telefone,
      username: user.username,
      password: "",
      level1_access: user.level1_access,
      level2_access: user.level2_access,
      level3_access: user.level3_access,
      whatsapp_enabled: user.whatsapp_enabled,
    })
    setShowForm(true)
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) throw error
      setSuccess('Usuário excluído com sucesso!')
      fetchUsers()
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error)
      setError(error.message || 'Erro ao excluir usuário')
    }
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !currentStatus })
        .eq('id', userId)

      if (error) throw error
      setSuccess('Status do usuário atualizado!')
      fetchUsers()
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error)
      setError(error.message || 'Erro ao atualizar status')
    }
  }

  const resetForm = () => {
    setFormData({
      atendente: "",
      telefone: "",
      username: "",
      password: "",
      level1_access: false,
      level2_access: false,
      level3_access: false,
      whatsapp_enabled: true,
    })
    setEditingUser(null)
    setShowForm(false)
    setShowPassword(false)
  }

  const getLevelBadges = (user: User) => {
    const badges = []
    if (user.level1_access) badges.push(<Badge key="1" variant="secondary">Nível 1</Badge>)
    if (user.level2_access) badges.push(<Badge key="2" variant="secondary">Nível 2</Badge>)
    if (user.level3_access) badges.push(<Badge key="3" variant="secondary">Nível 3</Badge>)
    return badges
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando usuários...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestão de Usuários</h2>
          <p className="text-muted-foreground">Gerencie os usuários do sistema</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Alertas */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-100 border border-green-200 rounded-lg text-green-800">
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}

      {/* Formulário */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="atendente">Atendente *</Label>
                  <Input
                    id="atendente"
                    value={formData.atendente}
                    onChange={(e) => setFormData({ ...formData, atendente: e.target.value })}
                    placeholder="Nome completo do atendente"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Usuário *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="nomeusuario"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha {editingUser ? '(deixe em branco para manter)' : '*'}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={editingUser ? "Nova senha (opcional)" : "Senha"}
                      required={!editingUser}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Níveis de Acesso */}
              <div className="space-y-3">
                <Label>Níveis de Acesso</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="level1"
                      checked={formData.level1_access}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, level1_access: checked as boolean })
                      }
                    />
                    <Label htmlFor="level1">Nível 1 - Abertura de Chamados</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="level2"
                      checked={formData.level2_access}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, level2_access: checked as boolean })
                      }
                    />
                    <Label htmlFor="level2">Nível 2 - Gestão Kanban</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="level3"
                      checked={formData.level3_access}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, level3_access: checked as boolean })
                      }
                    />
                    <Label htmlFor="level3">Nível 3 - Administração</Label>
                  </div>
                </div>
              </div>

              {/* Configurações WhatsApp */}
              <div className="space-y-3">
                <Label>Configurações de Notificação</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="whatsapp"
                    checked={formData.whatsapp_enabled}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, whatsapp_enabled: checked as boolean })
                    }
                  />
                  <Label htmlFor="whatsapp" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                    Receber notificações WhatsApp
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Quando habilitado, o usuário receberá notificações WhatsApp quando seus tickets forem resolvidos.
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  {editingUser ? 'Atualizar' : 'Criar'} Usuário
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium">{user.atendente}</h3>
                    <Badge variant={user.is_active ? "default" : "secondary"}>
                      {user.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Usuário: {user.username}</div>
                    {user.telefone && <div>Telefone: {user.telefone}</div>}
                    <div className="flex gap-2 mt-2">
                      {getLevelBadges(user)}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleUserStatus(user.id, user.is_active)}
                  >
                    {user.is_active ? "Desativar" : "Ativar"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(user.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {users.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum usuário cadastrado
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
