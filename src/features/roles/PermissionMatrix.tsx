import { LockOutlined } from '@ant-design/icons'
import { Checkbox, Flex, Table, Tooltip } from 'antd'
import { useMemo } from 'react'

import type { PermissionEntry, Role } from '../../api/types'

/** Colonnes des actions communes à toutes les tables. */
const ACTIONS = ['Voir', 'Ajouter', 'Modifier', 'Supprimer']

interface Row {
  rubric: string
  byAction: Record<string, PermissionEntry>
  others: PermissionEntry[]
}

/** Rubriques dans l'ordre du catalogue, chacune avec ses permissions. */
function rowsOf(catalogue: PermissionEntry[]): Row[] {
  const rows = new Map<string, Row>()
  for (const entry of catalogue) {
    const row = rows.get(entry.rubric) ?? { rubric: entry.rubric, byAction: {}, others: [] }
    if (ACTIONS.includes(entry.label)) row.byAction[entry.label] = entry
    else row.others.push(entry)
    rows.set(entry.rubric, row)
  }
  return [...rows.values()]
}

interface Props {
  catalogue: PermissionEntry[]
  role: Role
  checked: Set<string>
  onToggle: (perm: string, on: boolean) => void
}

/** Grille des permissions d'un rôle : une ligne par rubrique. Une
 *  permission imposée par le rôle est grisée, avec un cadenas. */
export function PermissionMatrix({ catalogue, role, checked, onToggle }: Props) {
  const rows = useMemo(() => rowsOf(catalogue), [catalogue])

  const box = (entry: PermissionEntry, label?: string) => {
    const forced = role.locked[entry.perm]
    const value = forced ?? checked.has(entry.perm)
    const control = (
      <Checkbox
        checked={value}
        disabled={forced !== undefined}
        onChange={(event) => onToggle(entry.perm, event.target.checked)}
      >
        {label}
        {forced !== undefined && <LockOutlined style={{ marginInlineStart: 4, opacity: 0.5 }} />}
      </Checkbox>
    )
    return forced === undefined ? control : (
      <Tooltip title={forced ? 'Toujours donnée à ce rôle' : 'Jamais donnée à ce rôle'}>
        {control}
      </Tooltip>
    )
  }

  return (
    <Table<Row>
      rowKey="rubric"
      size="small"
      pagination={false}
      dataSource={rows}
      columns={[
        { title: 'Rubrique', dataIndex: 'rubric', width: 240 },
        ...ACTIONS.map((action) => ({
          title: action,
          key: action,
          width: 100,
          align: 'center' as const,
          render: (_: unknown, row: Row) => (row.byAction[action] ? box(row.byAction[action]) : null),
        })),
        {
          title: 'Autres actions',
          key: 'others',
          render: (_: unknown, row: Row) => (
            <Flex vertical gap={4}>
              {row.others.map((entry) => (
                <span key={entry.perm}>{box(entry, entry.label)}</span>
              ))}
            </Flex>
          ),
        },
      ]}
    />
  )
}
