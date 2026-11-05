import { ReloadOutlined } from '@ant-design/icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { App, Button, Popconfirm } from 'antd'

import { api, errorMessage } from '../../api/client'
import type { LocalityImport } from '../../api/types'

/** Recharge la liste livrée avec l'API : ajoute ce qui manque, remet à
 *  jour le reste ; les localités ajoutées à la main restent. */
export function DefaultsButton() {
  const { message, modal } = App.useApp()
  const client = useQueryClient()
  const reload = useMutation({
    mutationFn: () => api<LocalityImport>('post', '/bo/localities/defaults/'),
    onSuccess: (result) => {
      client.invalidateQueries({ queryKey: ['localities'] })
      modal.success({
        title: 'Liste par défaut rechargée',
        content: `${result.created} localités ajoutées, ${result.updated} mises à jour, ${result.linked} fiches rattachées.`,
      })
    },
    onError: (error) => message.error(errorMessage(error)),
  })
  return (
    <Popconfirm
      title="Recharger la liste par défaut ?"
      description="Les localités modifiées à la main reprennent les valeurs par défaut."
      okText="Recharger"
      onConfirm={() => reload.mutate()}
    >
      <Button icon={<ReloadOutlined />} loading={reload.isPending}>
        Liste par défaut
      </Button>
    </Popconfirm>
  )
}
