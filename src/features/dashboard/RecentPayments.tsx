import { Card, List } from 'antd'
import { Link } from 'react-router-dom'

import type { Stats } from '../../api/dashboard'
import { formatDate, formatMoney } from '../../shared/format'

interface Props {
  payments: Stats['subscriptions']['recent_payments']
  currency: string
}

export function RecentPayments({ payments, currency }: Props) {
  return (
    <Card title="Derniers paiements" size="small" extra={<Link to="/payments">Tout voir</Link>}>
      <List
        dataSource={payments}
        locale={{ emptyText: 'Aucun paiement enregistré' }}
        renderItem={(payment) => (
          <List.Item extra={<b>{formatMoney(payment.amount, currency)}</b>}>
            <List.Item.Meta
              title={payment.organization}
              description={`${payment.plan} · ${payment.method} · ${formatDate(payment.paid_at)}`}
            />
          </List.Item>
        )}
      />
    </Card>
  )
}
