import { Col, Row } from 'antd'

import type { Stats } from '../../api/dashboard'
import { SectionTitle, StatTile } from './StatTile'

/** Clients : organisations, comptes, employés. */
export function ClientsSection({ clients }: { clients: Stats['clients'] }) {
  const organizations = Object.values(clients.organizations).reduce((sum, n) => sum + n, 0)
  const tiles = [
    { title: 'Organisations', value: organizations, to: '/organizations', hint: `${clients.farms} ferme(s)` },
    { title: 'Comptes fermiers', value: clients.accounts, to: '/accounts' },
    {
      title: 'Employés',
      value: clients.employees,
      to: '/employees',
      hint: clients.departures_contested ? `${clients.departures_contested} motif(s) contesté(s)` : undefined,
    },
    { title: 'Téléphones actifs (30 j)', value: clients.devices_30d },
  ]
  return (
    <>
      <SectionTitle>Clients</SectionTitle>
      <Row gutter={[16, 16]}>
        {tiles.map((tile) => (
          <Col key={tile.title} xs={12} md={6}>
            <StatTile {...tile} />
          </Col>
        ))}
      </Row>
    </>
  )
}
