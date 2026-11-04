import { DeleteOutlined } from '@ant-design/icons'
import { Alert, Button, Popconfirm, Table, Typography } from 'antd'

import { api } from '../../api/client'
import type { OrgDevice } from '../../api/types'
import { formatDate, fromNow } from '../../shared/format'
import { useAction, useList } from '../../shared/queries'

/** Téléphones vus en synchro ; chacun compte dans la limite du plan. */
export function DevicesTab({ id }: { id: string }) {
  const resource = `organizations/${id}/devices`
  const { data = [], isLoading } = useList<OrgDevice[]>(resource)
  const forget = useAction(resource, (device) => api('delete', `/bo/${resource}/${device}/`), {
    invalidate: ['organizations'],
    success: 'Téléphone oublié : sa place est libérée.',
  })

  return (
    <>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        title="Oublier un téléphone libère sa place. S'il se synchronise à nouveau, il reprend une place."
      />
      <Table<OrgDevice>
        rowKey="id"
        size="small"
        loading={isLoading}
        dataSource={data}
        pagination={false}
        locale={{ emptyText: 'Aucun téléphone' }}
        columns={[
          { title: 'Téléphone', dataIndex: 'device_id', render: (v: string) => <Typography.Text code>{v.slice(0, 10)}</Typography.Text> },
          { title: 'Compte', dataIndex: 'account' },
          { title: 'Vu pour la première fois', dataIndex: 'first_seen', render: formatDate },
          { title: 'Dernière synchro', dataIndex: 'last_seen', render: fromNow },
          {
            width: 48,
            render: (_, device) => (
              <Popconfirm title="Oublier ce téléphone ?" okText="Oublier" onConfirm={() => forget.mutate(device.id)}>
                <Button type="text" danger icon={<DeleteOutlined />} aria-label="Oublier" />
              </Popconfirm>
            ),
          },
        ]}
      />
    </>
  )
}
