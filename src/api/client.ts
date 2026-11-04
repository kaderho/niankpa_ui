import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { tokens } from './tokens'

/** Forme de toutes les réponses de l'API. */
interface Envelope<T> {
  success: boolean
  message: string
  data: T
  errors?: Record<string, unknown> | unknown[]
}

export const http = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? ''}/api`,
})

http.interceptors.request.use((config) => {
  const access = tokens.access()
  if (access) config.headers.Authorization = `Bearer ${access}`
  return config
})

/** Appelée quand la session ne peut plus être renouvelée. */
let onSessionEnded = () => {}
export function whenSessionEnds(callback: () => void) {
  onSessionEnded = callback
}

// Un seul renouvellement à la fois, même si plusieurs appels échouent ensemble.
let refreshing: Promise<string> | null = null

async function renewAccess(): Promise<string> {
  const refresh = tokens.refresh()
  if (!refresh) throw new Error('Pas de session')
  const { data } = await axios.post<Envelope<{ access: string; refresh?: string }>>(
    `${http.defaults.baseURL}/auth/token/refresh/`,
    { refresh },
  )
  tokens.save(data.data.access, data.data.refresh)
  return data.data.access
}

http.interceptors.response.use(undefined, async (error: AxiosError) => {
  const request = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined
  const isLogin = request?.url?.includes('/auth/')
  if (error.response?.status !== 401 || !request || request._retried || isLogin) {
    throw error
  }
  try {
    refreshing ??= renewAccess().finally(() => (refreshing = null))
    const access = await refreshing
    request._retried = true
    request.headers.Authorization = `Bearer ${access}`
    return http(request)
  } catch {
    tokens.clear()
    onSessionEnded()
    throw error
  }
})

/** Appelle l'API et rend directement le champ `data` de la réponse. */
export async function api<T>(
  method: 'get' | 'post' | 'patch' | 'put' | 'delete',
  url: string,
  body?: unknown,
  params?: Record<string, unknown>,
): Promise<T> {
  const response = await http.request<Envelope<T>>({ method, url, data: body, params })
  return response.data?.data as T
}

/** Erreurs d'un formulaire renvoyées par l'API, champ par champ. */
export function fieldErrors(error: unknown): Record<string, string[]> {
  const errors = (error as AxiosError<Envelope<unknown>>).response?.data?.errors
  if (!errors || Array.isArray(errors)) return {}
  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [
      field,
      Array.isArray(messages) ? messages.map(String) : [String(messages)],
    ]),
  )
}

/** Message lisible pour une erreur de l'API. */
export function errorMessage(error: unknown): string {
  const axiosError = error as AxiosError<Envelope<unknown>>
  if (!axiosError.response) return 'Serveur injoignable. Vérifiez la connexion.'
  const errors = fieldErrors(error)
  const first = errors.detail?.[0] ?? errors.non_field_errors?.[0] ?? Object.values(errors)[0]?.[0]
  if (first) return first
  if (axiosError.response.status === 403) return 'Accès refusé.'
  if (axiosError.response.status === 404) return 'Introuvable.'
  return axiosError.response.data?.message || 'Une erreur est survenue.'
}
