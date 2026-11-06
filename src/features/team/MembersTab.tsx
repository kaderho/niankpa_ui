import { CrownOutlined, EditOutlined, PlusOutlined, UserDeleteOutlined } from '@ant-design/icons'
import { App, Button, Flex, Popconfirm, Select, Switch, Table, Tag, Tooltip, Typography } from 'antd'
import { useCallback, useState } from 'react'

import { api, errorMessage } from '../../api/client'
import type { TeamGroup, TeamMember } from '../../api/types'
import { useAuth } from '../../auth/context'
import { formatDate, fromNow } from '../../shared/format'
import { useAction, useList, useSave } from '../../shared/queries'
import { SearchBar } from '../../shared/SearchBar'
import { BRAND } from '../../theme'
import { MemberModal } from './MemberModal'

/** Membres de l'équipe : leurs groupes, leur accès. */
export function MembersTab() {
  const { user } = useAuth()
  const { message } = App.useApp()
  const [params, setParams] = useState<Record<string, unknown>>({})
  const { data = [], isFetching } = useList<TeamMember[]>('team', params)
  const { data: groups = [] } = useList<TeamGroup[]>('groups')
  const [editing, setEditing] = useState<Partial<TeamMember> | null>(null)
  const save = useSave<TeamMember>('team', { success: 'Membre mis à jour.' })
  const remove = useAction('team', (id) => api('delete', `/bo/team/${id}/`), {
    success: 'Retiré de l\'équipe.',
    invalidate: ['groups', 'accounts'],
  })
  const onSearch = useCallback((search: string) => setParams((p) => ({ ...p, search })), [])
  const groupName = (id: number) => groups.find((group) => group.id === id)?.name ?? `#${id}`
  // Un super-administrateur ne se modifie que par un autre.
  const locked = (member: TeamMember) => member.is_superuser && !user?.is_superuser

  return (
    <Flex vertical gap={16}>
      <SearchBar placeholder="Numéro ou nom" onSearch={onSearch}>
        <Select
          allowClear
          placeholder="Groupe"
          style={{ width: 200 }}
          options={groups.map((group) => ({ value: group.id, label: group.name }))}
          onChange={(group) => setParams((p) => ({ ...p, group }))}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing({})}>
          Nouveau membre
        </Button>
      </SearchBar>
      <Table<TeamMember>
        rowKey="id"
        loading={isFetching}
        dataSource={data}
        pagination={false}
        scroll={{ x: 900 }}
        columns={[
          {
            title: 'Membre',
            render: (_, member) => (
              <Flex vertical>
                <Typography.Text strong>
                  {member.name || member.phone}{' '}
                  {member.is_superuser && (
                    <Tooltip title="Super-administrateur : toutes les rubriques">
                      <CrownOutlined style={{ color: BRAND.yellow }} />
                    </Tooltip>
                  )}
                </Typography.Text>
                {member.name && <Typography.Text type="secondary">{member.phone}</Typography.Text>}
              </Flex>
            ),
          },
          {
            title: 'Groupes',
            dataIndex: 'groups',
            render: (ids: number[], member) =>
              member.is_superuser ? (
                <Tag style={{ background: BRAND.yellowSoft, borderColor: BRAND.yellow, color: '#7A4F00' }}>Tout</Tag>
              ) : ids.length ? (
                <Flex wrap gap={4}>{ids.map((id) => <Tag key={id}>{groupName(id)}</Tag>)}</Flex>
              ) : (
                <Typography.Text type="warning">Aucun : ne voit rien</Typography.Text>
              ),
          },
          { title: 'Ajouté le', dataIndex: 'date_joined', render: formatDate },
          { title: 'Dernière connexion', dataIndex: 'last_login', render: fromNow },
          {
            title: 'Actif',
            dataIndex: 'is_active',
            align: 'center',
            render: (value: boolean, member) => (
              <Switch
                size="small"
                checked={value}
                disabled={member.id === user?.id || locked(member)}
                onChange={(is_active) =>
                  save.mutate({ id: member.id, is_active }, { onError: (error) => message.error(errorMessage(error)) })
                }
              />
            ),
          },
          {
            key: 'actions',
            width: 100,
            align: 'right',
            render: (_, member) => (
              <Flex gap={4} justify="end">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  aria-label="Modifier"
                  disabled={locked(member)}
                  onClick={() => setEditing(member)}
                />
                <Popconfirm
                  title={`Retirer ${member.name || member.phone} de l'équipe ?`}
                  description="Il perd le back-office et ses groupes ; son compte reste."
                  okText="Retirer"
                  cancelText="Annuler"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => remove.mutate(member.id)}
                  disabled={member.id === user?.id || locked(member)}
                >
                  <Button
                    type="text"
                    danger
                    icon={<UserDeleteOutlined />}
                    aria-label="Retirer de l'équipe"
                    disabled={member.id === user?.id || locked(member)}
                  />
                </Popconfirm>
              </Flex>
            ),
          },
        ]}
      />
      <MemberModal member={editing} onClose={() => setEditing(null)} />
    </Flex>
  )
}
