import { Alert, Col, Flex, Row, Skeleton } from 'antd'
import { Link } from 'react-router-dom'

import type { Stats } from '../../api/dashboard'
import { PageHeader } from '../../shared/PageHeader'
import { useList } from '../../shared/queries'
import { ApplicationSection } from './ApplicationSection'
import { ClientsSection } from './ClientsSection'
import { SubscriptionsSection } from './SubscriptionsSection'
import { TodoCard } from './TodoCard'

/** Vue d'ensemble, rangée comme le menu. Rien sur l'activité des fermes
 *  (lots, sujets, ventes…) : le back-office voit ses clients, pas ce qui se
 *  passe chez eux. */
export function DashboardPage() {
  const { data: stats, isLoading } = useList<Stats>('stats')

  if (isLoading || !stats) return <Skeleton active paragraph={{ rows: 10 }} />

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
      <Row gutter={[24, 24]}>
        <Col xs={24} xl={17}>
          <Flex vertical gap={16}>
            <ClientsSection clients={stats.clients} />
            <SubscriptionsSection
              clients={stats.clients}
              subscriptions={stats.subscriptions}
              currency={stats.currency}
            />
            <ApplicationSection application={stats.application} />
          </Flex>
        </Col>
        <Col xs={24} xl={7}>
          <TodoCard stats={stats} />
        </Col>
      </Row>
    </>
  )
}
