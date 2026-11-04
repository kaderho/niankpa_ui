import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Select, Table, Tag } from 'antd'
import { useCallback, useState } from 'react'

import type { Page, Payment, Plan } from '../../api/types'
import { formatDateTime, formatMoney } from '../../shared/format'
import { PageHeader } from '../../shared/PageHeader'
import { useCurrency, useList, useMeta } from '../../shared/queries'
import { SearchBar } from '../../shared/SearchBar'
import { PaymentModal } from './PaymentModal'

export function PaymentsPage() {
  const currency = useCurrency()
  const { data: meta } = useMeta()
  const { data: plans = [] } = useList<Plan[]>('plans')
  const [params, setParams] = useState<Record<string, unknown>>({ page: 1, page_size: 20 })
  const [adding, setAdding] = useState(false)
  const { data, isFetching } = useList<Page<Payment>>('payments', params)
  const onSearch = useCallback((search: string) => setParams((p) => ({ ...p, search, page: 1 })), [])
  const methodLabel = (value: string) => meta?.payment_methods.find((m) => m.value === value)?.label ?? value

  return (
    <>
      <PageHeader
        title="Paiements"
        subtitle="Chaque paiement enregistré prolonge l'abonnement de l'organisation."
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setAdding(true)}>Enregistrer un paiement</Button>}
      />
      <Card>
        <SearchBar placeholder="Organisation, code ou référence" onSearch={onSearch}>
          <Select
            allowClear
            placeholder="Moyen"
            style={{ width: 180 }}
            options={meta?.payment_methods}
            onChange={(method) => setParams((p) => ({ ...p, method, page: 1 }))}
          />
          <Select
            allowClear
            placeholder="Plan"
            style={{ width: 160 }}
            options={plans.map((p) => ({ value: p.id, label: p.name }))}
            onChange={(plan) => setParams((p) => ({ ...p, plan, page: 1 }))}
          />
        </SearchBar>
        <Table<Payment>
          rowKey="id"
          loading={isFetching}
          dataSource={data?.results}
          scroll={{ x: 800 }}
          pagination={{
            current: params.page as number,
            pageSize: params.page_size as number,
            total: data?.count,
            showSizeChanger: true,
            onChange: (page, page_size) => setParams((p) => ({ ...p, page, page_size })),
          }}
          columns={[
            { title: 'Payé le', dataIndex: 'paid_at', render: formatDateTime, width: 150 },
            { title: 'Organisation', dataIndex: 'organization_name' },
            { title: 'Plan', dataIndex: 'plan_name' },
            { title: 'Mois', dataIndex: 'months', align: 'right', width: 70 },
            { title: 'Montant', dataIndex: 'amount', align: 'right', render: (v: number) => <b>{formatMoney(v, currency)}</b> },
            { title: 'Moyen', dataIndex: 'method', render: (v: string) => <Tag>{methodLabel(v)}</Tag> },
            { title: 'Référence', dataIndex: 'reference', ellipsis: true },
          ]}
        />
      </Card>
      <PaymentModal open={adding} onClose={() => setAdding(false)} />
    </>
  )
}
