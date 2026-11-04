import { ReloadOutlined, SaveOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, App, Button, Flex, Popconfirm, Skeleton, Tabs, Typography } from 'antd'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { api, errorMessage } from '../../api/client'
import type { PermissionEntry, Role, RolesPayload } from '../../api/types'
import { PageHeader } from '../../shared/PageHeader'
import { PermissionMatrix } from './PermissionMatrix'

const KEY = ['roles']

/** Permissions d'un rôle, modifiables avant d'être enregistrées. */
function RoleTab({ role, catalogue }: { role: Role; catalogue: PermissionEntry[] }) {
  const client = useQueryClient()
  const { message } = App.useApp()
  const [checked, setChecked] = useState(() => new Set(role.permissions))
  const dirty =
    checked.size !== role.permissions.length || role.permissions.some((perm) => !checked.has(perm))

  const done = (text: string) => (saved: Role) => {
    setChecked(new Set(saved.permissions))
    client.invalidateQueries({ queryKey: KEY })
    message.success(text)
  }
  const save = useMutation({
    mutationFn: () => api<Role>('patch', `/bo/roles/${role.key}/`, { permissions: [...checked] }),
    onSuccess: done('Permissions enregistrées.'),
    onError: (error) => message.error(errorMessage(error)),
  })
  const reset = useMutation({
    mutationFn: () => api<Role>('post', `/bo/roles/${role.key}/reset/`),
    onSuccess: done('Rôle remis à ses valeurs par défaut.'),
    onError: (error) => message.error(errorMessage(error)),
  })

  const toggle = (perm: string, on: boolean) => {
    const next = new Set(checked)
    if (on) next.add(perm)
    else next.delete(perm)
    setChecked(next)
  }

  return (
    <Flex vertical gap={16}>
      <Flex justify="space-between" align="center" gap={8} wrap>
        <Typography.Text type="secondary">
          {checked.size} permission(s) cochée(s). Le téléphone n'affiche que ce que le rôle peut faire.
        </Typography.Text>
        <Flex gap={8}>
          <Popconfirm
            title={`Réinitialiser le rôle ${role.label} ?`}
            description="Les changements faits ici sur ce rôle seront perdus."
            okText="Réinitialiser"
            cancelText="Annuler"
            onConfirm={() => reset.mutate()}
          >
            <Button icon={<ReloadOutlined />} loading={reset.isPending}>Réinitialiser</Button>
          </Popconfirm>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            disabled={!dirty}
            loading={save.isPending}
            onClick={() => save.mutate()}
          >
            Enregistrer
          </Button>
        </Flex>
      </Flex>
      <PermissionMatrix catalogue={catalogue} role={role} checked={checked} onToggle={toggle} />
    </Flex>
  )
}

/** Rôles et permissions : ce que chaque rôle peut faire dans l'application. */
export function RolesPage() {
  const { tab } = useParams()
  const navigate = useNavigate()
  const client = useQueryClient()
  const { message } = App.useApp()
  const { data, isLoading } = useQuery({
    queryKey: KEY,
    queryFn: () => api<RolesPayload>('get', '/bo/roles/'),
  })
  const generate = useMutation({
    mutationFn: () => api<RolesPayload>('post', '/bo/roles/generate/'),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: KEY })
      message.success('Permissions par défaut ajoutées.')
    },
    onError: (error) => message.error(errorMessage(error)),
  })

  return (
    <>
      <PageHeader
        title="Rôles et permissions"
        subtitle="Une personne n'a qu'un rôle ; son rôle dit ce qu'elle peut voir et faire."
        extra={
          <Popconfirm
            title="Générer les permissions par défaut ?"
            description="Seules les permissions jamais données sont ajoutées ; vos changements restent."
            okText="Générer"
            cancelText="Annuler"
            onConfirm={() => generate.mutate()}
          >
            <Button icon={<ThunderboltOutlined />} loading={generate.isPending}>Générer par défaut</Button>
          </Popconfirm>
        }
      />
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        title="Certaines règles ne se règlent pas : l'agent n'agit que sur ses bâtiments, le vétérinaire ne touche qu'à ce qu'il a écrit, le propriétaire a toujours tout."
      />
      {isLoading || !data ? (
        <Skeleton active />
      ) : (
        <Tabs
          activeKey={tab ?? data.roles[0]?.key}
          onChange={(key) => navigate(`/roles/${key}`)}
          items={data.roles.map((role) => ({
            key: role.key,
            label: role.label,
            // La clé suit les permissions enregistrées : la grille repart d'elles.
            children: <RoleTab key={role.permissions.join()} role={role} catalogue={data.catalogue} />,
          }))}
        />
      )}
    </>
  )
}
