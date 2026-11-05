import { Card, Tabs } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'

import { PageHeader } from '../../shared/PageHeader'
import { CategoriesTab } from './CategoriesTab'
import { PartnerKindsTab } from './PartnerKindsTab'
import { ProductsPendingTab } from './ProductsPendingTab'
import { ReportsTab } from './ReportsTab'

const TABS = [
  { key: 'products', label: 'Produits à vérifier', children: <ProductsPendingTab /> },
  { key: 'reports', label: 'Signalements', children: <ReportsTab /> },
  { key: 'categories', label: 'Catégories', children: <CategoriesTab /> },
  { key: 'kinds', label: 'Précisions', children: <PartnerKindsTab /> },
]

/** Annuaire et marché : les produits des fournisseurs, vérifiés par les
 *  experts de l'équipe avant d'arriver chez les fermiers. */
export function PartnersPage() {
  const { tab = 'products' } = useParams()
  const navigate = useNavigate()
  return (
    <>
      <PageHeader
        title="Annuaire et marché"
        subtitle="Produits vérifiés par les experts de l'équipe avant d'arriver chez les fermiers."
      />
      <Card>
        <Tabs activeKey={tab} items={TABS} onChange={(key) => navigate(`/partners/${key}`)} destroyOnHidden />
      </Card>
    </>
  )
}
