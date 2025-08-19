"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { verifyPassword } from '@/lib/auth-utils'

interface User {
  id: string
  username: string
  atendente: string
  level1_access: boolean
  level2_access: boolean
  level3_access: boolean
  is_active: boolean
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  hasAccess: (level: 1 | 2 | 3) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Verificar se há usuário salvo no localStorage
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Buscar usuário no banco
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .single()

      if (error || !userData) {
        return false
      }

      // Verificar senha
      const isValidPassword = await verifyPassword(password, userData.password_hash)
      if (!isValidPassword) {
        return false
      }

      const user: User = {
        id: userData.id,
        username: userData.username,
        atendente: userData.atendente,
        level1_access: userData.level1_access,
        level2_access: userData.level2_access,
        level3_access: userData.level3_access,
        is_active: userData.is_active,
      }
      
      setUser(user)
      localStorage.setItem('user', JSON.stringify(user))
      return true
    } catch (error) {
      console.error('Erro no login:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const hasAccess = (level: 1 | 2 | 3): boolean => {
    if (!user) return false
    
    switch (level) {
      case 1:
        return user.level1_access
      case 2:
        return user.level2_access
      case 3:
        return user.level3_access
      default:
        return false
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, hasAccess }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
