import { App, Card, Select, Switch, Table, Tag, Tooltip, Typography } from 'antd'
import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'

import { errorMessage } from '../../api/client'
import type { Account, Page } from '../../api/types'
import { useAuth } from '../../auth/context'
import { formatDate, fromNow } from '../../shared/format'
import { PageHeader } from '../../shared/PageHeader'
import { useList, useSave } from '../../shared/queries'
import { SearchBar } from '../../shared/SearchBar'
import { BRAND } from '../../theme'

export function AccountsPage() {
  const { user } = useAuth()
  const { message } = App.useApp()
  const [params, setParams] = useState<Record<string, unknown>>({ page: 1, page_size: 20 })
  const { data, isFetching } = useList<Page<Account>>('accounts', params)
  const save = useSave<Account>('accounts', { success: 'Compte mis à jour.' })
  const onSearch = useCallback((search: string) => setParams((p) => ({ ...p, search, page: 1 })), [])

  const toggle = (account: Account, field: 'is_active' | 'is_staff', value: boolean) =>
    save.mutate({ id: account.id, [field]: value }, { onError: (error) => message.error(errorMessage(error)) })

  return (
    <>
      <PageHeader
        title="Comptes"
        subtitle="Comptes en ligne des fermiers et de l'équipe. Un compte suspendu ne peut plus se synchroniser."
      />
      <Card>
        <SearchBar placeholder="Numéro, ferme ou organisation" onSearch={onSearch}>
          <Select
            allowClear
            placeholder="Type"
            style={{ width: 170 }}
            options={[
              { value: 'false', label: 'Fermiers' },
              { value: 'true', label: 'Équipe' },
            ]}
            onChange={(is_staff) => setParams((p) => ({ ...p, is_staff, page: 1 }))}
          />
          <Select
            allowClear
            placeholder="État"
            style={{ width: 150 }}
            options={[
              { value: 'true', label: 'Actifs' },
              { value: 'false', label: 'Suspendus' },
            ]}
            onChange={(is_active) => setParams((p) => ({ ...p, is_active, page: 1 }))}
          />
        </SearchBar>
        <Table<Account>
          rowKey="id"
          loading={isFetching}
          dataSource={data?.results}
          scroll={{ x: 900 }}
          pagination={{
            current: params.page as number,
            pageSize: params.page_size as number,
            total: data?.count,
            showSizeChanger: true,
            onChange: (page, page_size) => setParams((p) => ({ ...p, page, page_size })),
          }}
          columns={[
            {
              title: 'Numéro',
              dataIndex: 'phone',
              render: (phone: string, account) => (
                <>
                  <Typography.Text strong>{phone}</Typography.Text>{' '}
                  {account.is_staff && <Tag style={{ background: BRAND.yellowSoft, borderColor: BRAND.yellow, color: '#7A4F00' }}>Équipe</Tag>}
                </>
              ),
            },
            { title: 'Ferme', dataIndex: 'farm_name', render: (v: string | null) => v ?? '—' },
            {
              title: 'Organisation',
              render: (_, account) =>
                account.organization ? (
                  <Link to={`/organizations/${account.organization}`}>{account.organization_name}</Link>
                ) : '—',
            },
            { title: 'Inscrit le', dataIndex: 'date_joined', render: formatDate },
            { title: 'Dernière connexion', dataIndex: 'last_login', render: fromNow },
            {
              title: 'Actif',
              dataIndex: 'is_active',
              align: 'center',
              render: (value: boolean, account) => (
                <Switch
                  size="small"
                  checked={value}
                  disabled={account.id === user?.id}
                  onChange={(checked) => toggle(account, 'is_active', checked)}
                />
              ),
            },
            {
              title: <Tooltip title="Accès au back-office">Équipe</Tooltip>,
              dataIndex: 'is_staff',
              align: 'center',
              render: (value: boolean, account) => (
                <Switch
                  size="small"
                  checked={value}
                  disabled={account.id === user?.id}
                  onChange={(checked) => toggle(account, 'is_staff', checked)}
                />
              ),
            },
          ]}
        />
      </Card>
    </>
  )
}
