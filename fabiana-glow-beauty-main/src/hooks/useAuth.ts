import { useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface AuthState {
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ loading: false, error: null })

  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    setState({ loading: true, error: null })

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setState({ loading: false, error: error.message })
      return false
    }

    setState({ loading: false, error: null })
    return true
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return { ...state, signIn, signOut }
}
