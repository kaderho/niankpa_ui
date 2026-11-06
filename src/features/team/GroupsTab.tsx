import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Flex, Popconfirm, Table, Tag, Typography } from 'antd'
import { useState } from 'react'

import { api } from '../../api/client'
import type { TeamGroup } from '../../api/types'
import { useAction, useList, useMeta } from '../../shared/queries'
import { GroupModal } from './GroupModal'
import { sectionLabel } from './sections'

/** Groupes de l'équipe, et les rubriques que chacun ouvre. */
export function GroupsTab() {
  const { data = [], isFetching } = useList<TeamGroup[]>('groups')
  const { data: meta } = useMeta()
  const [editing, setEditing] = useState<Partial<TeamGroup> | null>(null)
  const remove = useAction('groups', (id) => api('delete', `/bo/groups/${id}/`), {
    success: 'Groupe supprimé.',
    invalidate: ['team'],
  })

  return (
    <Flex vertical gap={16}>
      <Flex justify="space-between" align="center" gap={8} wrap>
        <Typography.Text type="secondary">
          Un membre a les rubriques de tous ses groupes réunis.
        </Typography.Text>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing({})}>
          Nouveau groupe
        </Button>
      </Flex>
      <Table<TeamGroup>
        rowKey="id"
        loading={isFetching}
        dataSource={data}
        pagination={false}
        scroll={{ x: 700 }}
        columns={[
          { title: 'Groupe', dataIndex: 'name', render: (name: string) => <Typography.Text strong>{name}</Typography.Text> },
          {
            title: 'Rubriques',
            dataIndex: 'sections',
            render: (sections: string[]) =>
              sections.length ? (
                <Flex wrap gap={4}>
                  {sections.map((key) => (
                    <Tag key={key}>{sectionLabel(meta?.sections ?? [], key)}</Tag>
                  ))}
                </Flex>
              ) : (
                <Typography.Text type="secondary">Aucune</Typography.Text>
              ),
          },
          { title: 'Membres', dataIndex: 'members', align: 'center', width: 100 },
          {
            key: 'actions',
            width: 100,
            align: 'right',
            render: (_, group) => (
              <Flex gap={4} justify="end">
                <Button type="text" icon={<EditOutlined />} aria-label="Modifier" onClick={() => setEditing(group)} />
                <Popconfirm
                  title={`Supprimer le groupe ${group.name} ?`}
                  description="Ses membres perdent les rubriques qu'il leur ouvrait."
                  okText="Supprimer"
                  cancelText="Annuler"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => remove.mutate(group.id)}
                >
                  <Button type="text" danger icon={<DeleteOutlined />} aria-label="Supprimer" />
                </Popconfirm>
              </Flex>
            ),
          },
        ]}
      />
      <GroupModal group={editing} onClose={() => setEditing(null)} />
    </Flex>
  )
}
