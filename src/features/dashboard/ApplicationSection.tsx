import { Col, Row } from 'antd'

import type { Stats } from '../../api/dashboard'
import { SectionTitle, StatTile } from './StatTile'

/** Application : ce que l'équipe tient pour toutes les fermes. */
export function ApplicationSection({ application }: { application: Stats['application'] }) {
  const { references, localities, suppliers, directory } = application
  const unplaced = localities.farms_unplaced + localities.partners_unplaced
  const tiles = [
    {
      title: 'Listes de référence',
      value: Object.values(references).reduce((sum, n) => sum + n, 0),
      to: '/references',
      hint: `${references.species} espèce(s) · ${references.programs} programme(s) · ${references.standards} standard(s)`,
    },
    {
      title: 'Localités',
      value: localities.total,
      to: '/localities',
      hint: unplaced ? `${unplaced} fiche(s) sans localité` : 'Toutes les fiches sont situées',
    },
    {
      title: 'Fournisseurs vérifiés',
      value: suppliers.verifie,
      to: '/suppliers/verified',
      hint: `${suppliers.attente} à vérifier · ${suppliers.suspendu} suspendu(s)`,
    },
    {
      title: 'Annuaire : produits',
      value: directory.products,
      to: '/partners/products',
      hint: `${directory.products_pending} à vérifier · ${directory.reports_open} signalement(s)`,
    },
  ]
  return (
    <>
      <SectionTitle>Application</SectionTitle>
      <Row gutter={[16, 16]}>
        {tiles.map((tile) => (
          <Col key={tile.title} xs={24} sm={12} xl={6}>
            <StatTile {...tile} />
          </Col>
        ))}
      </Row>
    </>
  )
}
