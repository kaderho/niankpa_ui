import { Alert, Card, Col, Flex, List, Row, Skeleton, Statistic, Typography } from 'antd'
import { Link } from 'react-router-dom'

import type { OrgStatus, Stats } from '../../api/types'
import { formatDate, formatMoney } from '../../shared/format'
import { PageHeader } from '../../shared/PageHeader'
import { useList } from '../../shared/queries'
import { STATUSES } from '../../shared/statuses'
import { StatusTag } from '../../shared/StatusTag'
import { RevenueChart } from './RevenueChart'

const ORDER: OrgStatus[] = ['active', 'trial', 'grace', 'expired']

export function DashboardPage() {
  const { data: stats, isLoading } = useList<Stats>('stats')

  if (isLoading || !stats) return <Skeleton active paragraph={{ rows: 10 }} />

  const total = ORDER.reduce((sum, status) => sum + stats.organizations[status], 0)
  const tiles = [
    { title: 'Organisations', value: total, to: '/organizations' },
    { title: 'Fermes', value: stats.farms },
    { title: 'Comptes fermiers', value: stats.accounts, to: '/accounts' },
    { title: 'Téléphones actifs (30 j)', value: stats.devices_30d },
    { title: 'Lots en cours', value: stats.flocks },
    { title: 'Sujets en élevage', value: stats.birds },
  ]

  return (
    <>
      <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble de Nian Kpa" />
      {!stats.saas_enabled && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
          title="Le mode SaaS est éteint : aucune limite ni échéance n'est appliquée."
          action={<Link to="/config">Configurer</Link>}
        />
      )}
      <Row gutter={[16, 16]}>
        {tiles.map((tile) => (
          <Col key={tile.title} xs={12} md={8} xl={4}>
            <Card size="small" hoverable={Boolean(tile.to)}>
              {tile.to ? (
                <Link to={tile.to}>
                  <Statistic title={tile.title} value={tile.value} groupSeparator=" " />
                </Link>
              ) : (
                <Statistic title={tile.title} value={tile.value} groupSeparator=" " />
              )}
            </Card>
          </Col>
        ))}

        <Col xs={24} lg={14}>
          <Card
            title="Recettes par mois"
            extra={
              <Typography.Text type="secondary">
                30 derniers jours : <b>{formatMoney(stats.revenue_30d, stats.currency)}</b>
              </Typography.Text>
            }
          >
            <RevenueChart rows={stats.revenue_by_month} currency={stats.currency} />
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="Abonnements" style={{ height: '100%' }}>
            <Flex vertical gap={14}>
              {ORDER.map((status) => (
                <Link key={status} to={`/organizations?status=${status}`}>
                  <Flex justify="space-between" align="center">
                    <StatusTag status={status} />
                    <Typography.Text strong>
                      {stats.organizations[status]}
                      <Typography.Text type="secondary"> / {total}</Typography.Text>
                    </Typography.Text>
                  </Flex>
                </Link>
              ))}
            </Flex>
            <Typography.Paragraph type="secondary" style={{ marginTop: 16, marginBottom: 0 }}>
              {STATUSES.grace.label} : échéance passée, accès encore ouvert.
            </Typography.Paragraph>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Derniers paiements" extra={<Link to="/payments">Tout voir</Link>}>
            <List
              dataSource={stats.recent_payments}
              locale={{ emptyText: 'Aucun paiement enregistré' }}
              renderItem={(payment) => (
                <List.Item extra={<b>{formatMoney(payment.amount, stats.currency)}</b>}>
                  <List.Item.Meta
                    title={payment.organization}
                    description={`${payment.plan} · ${payment.method} · ${formatDate(payment.paid_at)}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </>
  )
}
