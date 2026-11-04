import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App } from 'antd'

import { api, errorMessage } from '../api/client'
import type { GlobalConfig, Meta } from '../api/types'

/** Libellés et choix du back-office : lus une fois par session. */
export function useMeta() {
  return useQuery({
    queryKey: ['meta'],
    queryFn: () => api<Meta>('get', '/bo/meta/'),
    staleTime: Infinity,
  })
}

/** Devise de la configuration globale, pour afficher les montants. */
export function useCurrency() {
  const { data } = useQuery({
    queryKey: ['config'],
    queryFn: () => api<GlobalConfig>('get', '/bo/config/'),
    staleTime: 5 * 60_000,
  })
  return data?.currency ?? 'FCFA'
}

/** Liste d'une ressource de /api/bo/, avec ses filtres. */
export function useList<T>(resource: string, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [resource, params ?? {}],
    queryFn: () => api<T>('get', `/bo/${resource}/`, undefined, params),
    placeholderData: (previous) => previous,
  })
}

/** Création ou modification d'une ligne ; rafraîchit les listes touchées. */
export function useSave<T extends { id?: string | number }>(
  resource: string,
  options: { invalidate?: string[]; success?: string } = {},
) {
  const client = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<T> & { id?: string | number }) =>
      id == null
        ? api<T>('post', `/bo/${resource}/`, body)
        : api<T>('patch', `/bo/${resource}/${id}/`, body),
    onSuccess: () => {
      for (const key of [resource, ...(options.invalidate ?? [])]) {
        client.invalidateQueries({ queryKey: [key] })
      }
      message.success(options.success ?? 'Enregistré.')
    },
  })
}

/** Action ponctuelle sur une ligne (supprimer, rétablir…). */
export function useAction(
  resource: string,
  run: (id: string | number) => Promise<unknown>,
  options: { invalidate?: string[]; success: string },
) {
  const client = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: run,
    onSuccess: () => {
      for (const key of [resource, ...(options.invalidate ?? [])]) {
        client.invalidateQueries({ queryKey: [key] })
      }
      message.success(options.success)
    },
    onError: (error) => message.error(errorMessage(error)),
  })
}
