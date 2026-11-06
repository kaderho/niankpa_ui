import { Card, Col, Row, Typography } from 'antd'

import type { OrgStatus } from '../../api/types'
import type { Stats } from '../../api/dashboard'
import { formatMoney } from '../../shared/format'
import { STATUSES } from '../../shared/statuses'
import { StatusTag } from '../../shared/StatusTag'
import { CountsCard } from './CountsCard'
import { RecentPayments } from './RecentPayments'
import { RevenueChart } from './RevenueChart'
import { SectionTitle } from './StatTile'

const ORDER: OrgStatus[] = ['active', 'trial', 'grace', 'expired']

interface Props {
  clients: Stats['clients']
  subscriptions: Stats['subscriptions']
  currency: string
}

/** Abonnements : plans, paiements, paiements en ligne, vétérinaires et techniciens. */
export function SubscriptionsSection({ clients, subscriptions, currency }: Props) {
  const { checkouts, vets, technicians } = subscriptions
  return (
    <>
      <SectionTitle>Abonnements</SectionTitle>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title="Paiements par mois"
            size="small"
            style={{ height: '100%' }}
            extra={
              <Typography.Text type="secondary">
                30 derniers jours : <b>{formatMoney(subscriptions.revenue_30d, currency)}</b>
                {` (${subscriptions.payments_30d})`}
              </Typography.Text>
            }
          >
            <RevenueChart rows={subscriptions.revenue_by_month} currency={currency} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <CountsCard
            title="Organisations par état"
            rows={ORDER.map((status) => ({
              key: status,
              label: <StatusTag status={status} />,
              count: clients.organizations[status],
              to: `/organizations?status=${status}`,
            }))}
            footer={`${STATUSES.grace.label} : échéance passée, accès encore ouvert. ${clients.ending_soon} échéance(s) dans les 7 jours.`}
          />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <CountsCard
            title="Plans"
            to="/plans"
            rows={subscriptions.plans.map((plan) => ({
              key: String(plan.id),
              label: plan.name,
              count: plan.organizations,
              to: plan.id ? `/organizations?plan=${plan.id}` : undefined,
            }))}
          />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <CountsCard
            title="Paiements en ligne"
            to="/checkouts"
            rows={[
              { key: 'pending', label: 'En attente', count: checkouts.pending },
              { key: 'completed', label: 'Encaissés (30 j)', count: checkouts.completed_30d },
              { key: 'cancelled', label: 'Annulés (30 j)', count: checkouts.cancelled_30d },
            ]}
          />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <CountsCard
            title="Vétérinaires"
            to="/vets"
            rows={[
              { key: 'active', label: 'Forfait payé', count: vets.active },
              { key: 'trial', label: 'Essai', count: vets.trial },
              { key: 'expired', label: 'Échu', count: vets.expired },
            ]}
          />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <CountsCard
            title="Techniciens"
            to="/vets"
            rows={[
              { key: 'active', label: 'Forfait payé', count: technicians?.active ?? 0 },
              { key: 'trial', label: 'Essai', count: technicians?.trial ?? 0 },
              { key: 'expired', label: 'Échu', count: technicians?.expired ?? 0 },
            ]}
          />
        </Col>
        <Col span={24}>
          <RecentPayments payments={subscriptions.recent_payments} currency={currency} />
        </Col>
      </Row>
    </>
  )
}
