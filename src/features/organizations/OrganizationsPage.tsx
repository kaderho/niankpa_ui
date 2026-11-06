import { Card, Select, Table, Typography } from 'antd'
import { useCallback, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import type { Organization, OrgStatus, Page, Plan } from '../../api/types'
import { formatDate } from '../../shared/format'
import { PageHeader } from '../../shared/PageHeader'
import { useList } from '../../shared/queries'
import { SearchBar } from '../../shared/SearchBar'
import { STATUSES } from '../../shared/statuses'
import { StatusTag } from '../../shared/StatusTag'
import { OrganizationDrawer } from './OrganizationDrawer'

export function OrganizationsPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [query] = useSearchParams()
  const { data: plans = [] } = useList<Plan[]>('plans')
  const [params, setParams] = useState<Record<string, unknown>>({
    page: 1,
    page_size: 20,
    status: query.get('status') ?? undefined,
    plan: query.get('plan') ? Number(query.get('plan')) : undefined,
  })
  const { data, isFetching } = useList<Page<Organization>>('organizations', params)
  const onSearch = useCallback((search: string) => setParams((p) => ({ ...p, search, page: 1 })), [])

  return (
    <>
      <PageHeader
        title="Organisations"
        subtitle="Clients : une ou plusieurs fermes, un abonnement."
      />
      <Card>
        <SearchBar placeholder="Nom, code ou numéro de téléphone" onSearch={onSearch}>
          <Select
            allowClear
            placeholder="État"
            style={{ width: 170 }}
            value={params.status as OrgStatus | undefined}
            options={Object.entries(STATUSES).map(([value, { label }]) => ({ value, label }))}
            onChange={(status) => setParams((p) => ({ ...p, status, page: 1 }))}
          />
          <Select
            allowClear
            placeholder="Plan"
            style={{ width: 160 }}
            options={plans.map((p) => ({ value: p.id, label: p.name }))}
            onChange={(plan) => setParams((p) => ({ ...p, plan, page: 1 }))}
          />
        </SearchBar>
        <Table<Organization>
          rowKey="id"
          loading={isFetching}
          dataSource={data?.results}
          scroll={{ x: 900 }}
          rowClassName="clickable-row"
          onRow={(organization) => ({ onClick: () => navigate(`/organizations/${organization.id}`) })}
          pagination={{
            current: params.page as number,
            pageSize: params.page_size as number,
            total: data?.count,
            showSizeChanger: true,
            showTotal: (total) => `${total} organisation${total > 1 ? 's' : ''}`,
            onChange: (page, page_size) => setParams((p) => ({ ...p, page, page_size })),
          }}
          columns={[
            {
              title: 'Organisation',
              render: (_, o) => (
                <>
                  <Typography.Text strong>{o.name || 'Sans nom'}</Typography.Text>
                  <br />
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {o.owner_phone ?? 'Sans propriétaire'}
                  </Typography.Text>
                </>
              ),
            },
            { title: 'Code', dataIndex: 'code', render: (code: string) => <Typography.Text code>{code}</Typography.Text> },
            { title: 'Plan', dataIndex: 'plan_name', render: (name: string | null) => name ?? '—' },
            { title: 'État', dataIndex: 'status', render: (status: OrgStatus) => <StatusTag status={status} /> },
            { title: 'Échéance', render: (_, o) => formatDate(o.paid_until ?? o.trial_ends_at) },
            { title: 'Fermes', dataIndex: 'farms_count', align: 'right', width: 80 },
            { title: 'Téléphones', dataIndex: 'devices_count', align: 'right', width: 100 },
            { title: 'Créée le', dataIndex: 'created_at', render: formatDate },
          ]}
        />
      </Card>
      <OrganizationDrawer id={id} onClose={() => navigate('/organizations')} />
    </>
  )
}
