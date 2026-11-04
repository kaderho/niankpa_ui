import { List, Tag, Typography } from 'antd'

import type { OrgFarm } from '../../api/types'
import { useList } from '../../shared/queries'

export function FarmsTab({ id }: { id: string }) {
  const { data = [], isLoading } = useList<OrgFarm[]>(`organizations/${id}/farms`)
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
            description={farm.locality ?? 'Localité inconnue'}
          />
          <Typography.Text type="secondary">
            {farm.accounts.length ? farm.accounts.join(', ') : 'Sans compte propre'}
          </Typography.Text>
        </List.Item>
      )}
    />
  )
}
