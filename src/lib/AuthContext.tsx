import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type AuthState =
  | { type: 'loading' }
  | { type: 'authenticated'; user: User }
  | { type: 'unauthenticated' }

type AuthContextType = {
  authState: AuthState
  user: User | null
  isLoadingAuth: boolean
  isLoadingPublicSettings: boolean
  authError: null
  navigateToLogin: () => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient()
  const [authState, setAuthState] = useState<AuthState>({ type: 'loading' })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthState({ type: 'authenticated', user: session.user })
      } else {
        setAuthState({ type: 'unauthenticated' })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthState({ type: 'authenticated', user: session.user })
      } else {
        setAuthState({ type: 'unauthenticated' })
        queryClient.resetQueries()
      }
    })

    return () => subscription.unsubscribe()
  }, [queryClient])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    queryClient.resetQueries()
  }, [queryClient])

  const navigateToLogin = useCallback(() => {
    window.location.href = '/login'
  }, [])

  return (
    <AuthContext.Provider value={{
      authState,
      user: authState.type === 'authenticated' ? authState.user : null,
      isLoadingAuth: authState.type === 'loading',
      isLoadingPublicSettings: false,
      authError: null,
      navigateToLogin,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
