import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { api, whenSessionEnds } from '../api/client'
import { tokens } from '../api/tokens'
import type { StaffUser } from '../api/types'
import { AuthContext } from './context'


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const client = useQueryClient()
  const [user, setUser] = useState<StaffUser | null>(null)
  const [checking, setChecking] = useState(Boolean(tokens.access()))

  const logout = useCallback(() => {
    tokens.clear()
    setUser(null)
    client.clear()
  }, [client])

  useEffect(() => {
    whenSessionEnds(logout)
    if (!tokens.access()) return
    api<StaffUser>('get', '/bo/me/')
      .then(setUser)
      .catch(logout)
      .finally(() => setChecking(false))
  }, [logout])

  const login = useCallback(async (phone: string, password: string) => {
    const session = await api<{ access: string; refresh: string; user: StaffUser }>(
      'post',
      '/bo/auth/login/',
      { phone, password },
    )
    tokens.save(session.access, session.refresh)
    setUser(session.user)
  }, [])

  const value = useMemo(() => ({ user, checking, login, logout }), [user, checking, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
