import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { Card, Select, Table, Tag, Typography } from 'antd'
import { useCallback, useState } from 'react'

import type { Checkout, Page } from '../../api/types'
import { formatDateTime, formatMoney } from '../../shared/format'
import { PageHeader } from '../../shared/PageHeader'
import { useCurrency, useList } from '../../shared/queries'
import { SearchBar } from '../../shared/SearchBar'

const STATES = {
  pending: { label: 'En attente', color: 'processing', icon: <ClockCircleOutlined /> },
  completed: { label: 'Encaissé', color: 'success', icon: <CheckCircleOutlined /> },
  cancelled: { label: 'Annulé', color: 'default', icon: <CloseCircleOutlined /> },
}

/** Journal des paiements en ligne PayDunya, en lecture seule. */
export function CheckoutsPage() {
  const currency = useCurrency()
  const [params, setParams] = useState<Record<string, unknown>>({ page: 1, page_size: 20 })
  const { data, isFetching } = useList<Page<Checkout>>('checkouts', params)
  const onSearch = useCallback((search: string) => setParams((p) => ({ ...p, search, page: 1 })), [])

  return (
    <>
      <PageHeader
        title="Paiements en ligne"
        subtitle="Demandes de paiement PayDunya lancées depuis l'application."
      />
      <Card>
        <SearchBar placeholder="Organisation, code ou jeton" onSearch={onSearch}>
          <Select
            allowClear
            placeholder="État"
            style={{ width: 160 }}
            options={Object.entries(STATES).map(([value, { label }]) => ({ value, label }))}
            onChange={(status) => setParams((p) => ({ ...p, status, page: 1 }))}
          />
        </SearchBar>
        <Table<Checkout>
          rowKey="id"
          loading={isFetching}
          dataSource={data?.results}
          scroll={{ x: 800 }}
          pagination={{
            current: params.page as number,
            pageSize: params.page_size as number,
            total: data?.count,
            onChange: (page, page_size) => setParams((p) => ({ ...p, page, page_size })),
          }}
          columns={[
            { title: 'Demandé le', dataIndex: 'created_at', render: formatDateTime, width: 150 },
            { title: 'Organisation', dataIndex: 'organization_name' },
            { title: 'Plan', dataIndex: 'plan_name' },
            { title: 'Mois', dataIndex: 'months', align: 'right', width: 70 },
            { title: 'Montant', dataIndex: 'amount', align: 'right', render: (v: number) => formatMoney(v, currency) },
            {
              title: 'État',
              dataIndex: 'status',
              render: (status: Checkout['status']) => {
                const state = STATES[status] ?? STATES.pending
                return <Tag color={state.color} icon={state.icon}>{state.label}</Tag>
              },
            },
            {
              title: 'Jeton',
              dataIndex: 'token',
              render: (token: string) => <Typography.Text copyable={{ text: token }} code>{token.slice(0, 12)}…</Typography.Text>,
            },
          ]}
        />
      </Card>
    </>
  )
}
