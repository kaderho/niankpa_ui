import { createContext, useContext } from 'react'

import type { StaffUser } from '../api/types'

export interface Auth {
  user: StaffUser | null
  /** Vrai tant que la session enregistrée n'a pas été vérifiée. */
  checking: boolean
  login: (phone: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<Auth | null>(null)

export function useAuth() {
  const auth = useContext(AuthContext)
  if (!auth) throw new Error('useAuth hors de AuthProvider')
  return auth
}
