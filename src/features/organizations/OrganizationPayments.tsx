import { PlusOutlined } from '@ant-design/icons'
import { Button, Table, Tag } from 'antd'
import { useState } from 'react'

import type { Organization, Page, Payment } from '../../api/types'
import { formatDate, formatMoney } from '../../shared/format'
import { useCurrency, useList, useMeta } from '../../shared/queries'
import { PaymentModal } from '../payments/PaymentModal'

export function OrganizationPayments({ organization }: { organization: Organization }) {
  const currency = useCurrency()
  const { data: meta } = useMeta()
  const [adding, setAdding] = useState(false)
  const { data, isFetching } = useList<Page<Payment>>('payments', {
    organization: organization.id,
    page_size: 100,
  })
  const methodLabel = (value: string) => meta?.payment_methods.find((m) => m.value === value)?.label ?? value

  return (
    <>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setAdding(true)} style={{ marginBottom: 16 }}>
        Enregistrer un paiement
      </Button>
      <Table<Payment>
        rowKey="id"
        size="small"
        loading={isFetching}
        dataSource={data?.results}
        pagination={false}
        locale={{ emptyText: 'Aucun paiement' }}
        columns={[
          { title: 'Payé le', dataIndex: 'paid_at', render: formatDate },
          { title: 'Plan', dataIndex: 'plan_name' },
          { title: 'Mois', dataIndex: 'months', align: 'right' },
          { title: 'Montant', dataIndex: 'amount', align: 'right', render: (v: number) => formatMoney(v, currency) },
          { title: 'Moyen', dataIndex: 'method', render: (v: string) => <Tag>{methodLabel(v)}</Tag> },
        ]}
      />
      <PaymentModal open={adding} onClose={() => setAdding(false)} organization={organization} />
    </>
  )
}
