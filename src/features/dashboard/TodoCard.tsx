import { CheckCircleOutlined, RightOutlined } from '@ant-design/icons'
import { Card, Flex, List, Typography } from 'antd'
import { Link } from 'react-router-dom'

import type { Stats } from '../../api/dashboard'

/** Ce qui attend l'équipe aujourd'hui ; les lignes à zéro disparaissent. */
export function TodoCard({ stats }: { stats: Stats }) {
  const { clients, subscriptions, application } = stats
  const unplaced = application.localities.farms_unplaced + application.localities.partners_unplaced
  const items = [
    { count: clients.organizations.grace, label: 'organisation(s) en délai de grâce', to: '/organizations?status=grace' },
    { count: clients.ending_soon, label: 'échéance(s) dans les 7 jours', to: '/organizations' },
    { count: subscriptions.checkouts.pending, label: 'paiement(s) en ligne en attente', to: '/checkouts' },
    { count: application.suppliers.attente, label: 'fournisseur(s) à vérifier', to: '/suppliers/pending' },
    { count: application.directory.products_pending, label: 'produit(s) à vérifier', to: '/partners/products' },
    { count: application.directory.reports_open, label: 'signalement(s) à traiter', to: '/partners/reports' },
    { count: clients.departures_contested, label: 'motif(s) de départ contesté(s)', to: '/employees/departures' },
    { count: unplaced, label: 'ferme(s) ou fournisseur(s) sans localité', to: '/localities' },
  ].filter((item) => item.count > 0)

  return (
    <Card title="À traiter" size="small">
      {items.length === 0 ? (
        <Flex align="center" gap={8}>
          <CheckCircleOutlined />
          <Typography.Text type="secondary">Rien en attente.</Typography.Text>
        </Flex>
      ) : (
        <List
          size="small"
          dataSource={items}
          renderItem={(item) => (
            <List.Item>
              <Link to={item.to} style={{ width: '100%' }}>
                <Flex justify="space-between" align="center">
                  <span>
                    <Typography.Text strong>{item.count}</Typography.Text> {item.label}
                  </span>
                  <RightOutlined />
                </Flex>
              </Link>
            </List.Item>
          )}
        />
      )}
    </Card>
  )
}
