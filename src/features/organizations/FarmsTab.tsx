import { useMutation, useQueryClient } from '@tanstack/react-query'
import { App, List, Space, Tag, Typography } from 'antd'

import { api, errorMessage } from '../../api/client'
import type { OrgFarm } from '../../api/types'
import { LocalitySelect } from '../../shared/LocalitySelect'
import { useList } from '../../shared/queries'

export function FarmsTab({ id }: { id: string }) {
  const resource = `organizations/${id}/farms`
  const { data = [], isLoading } = useList<OrgFarm[]>(resource)
  const client = useQueryClient()
  const { message } = App.useApp()
  // Une ferme change de localité ; vide, elle reprend la plus proche de sa position.
  const move = useMutation({
    mutationFn: ({ farm, place }: { farm: string; place: number | null }) =>
      api('patch', `/bo/${resource}/${farm}/place/`, { place }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: [resource] })
      message.success('Localité enregistrée.')
    },
    onError: (error) => message.error(errorMessage(error)),
  })
  return (
    <List
      loading={isLoading}
      dataSource={data}
      locale={{ emptyText: 'Aucune ferme envoyée pour le moment' }}
      renderItem={(farm) => (
        <List.Item>
          <List.Item.Meta
            title={
              <>
                {farm.name} {farm.deleted && <Tag>Supprimée</Tag>}
              </>
            }
            description={
              <Space direction="vertical" size={4}>
                <span>
                  {farm.locality ?? 'Localité non saisie'}
                  {farm.latitude == null ? (
                    <Tag color="orange" style={{ marginLeft: 8 }}>Sans position</Tag>
                  ) : (
                    ` · ${farm.latitude.toFixed(4)}, ${farm.longitude?.toFixed(4)}`
                  )}
                </span>
                <LocalitySelect
                  value={farm.place}
                  label={farm.place_label}
                  onChange={(place) => move.mutate({ farm: farm.id, place })}
                />
              </Space>
            }
          />
          <Typography.Text type="secondary">
            {farm.accounts.length ? farm.accounts.join(', ') : 'Sans compte propre'}
          </Typography.Text>
        </List.Item>
      )}
    />
  )
}
