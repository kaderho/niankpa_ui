import { Card, Tabs } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'

import { PageHeader } from '../../shared/PageHeader'
import { PartnersTable } from './PartnersTable'

const TABS = [
  { key: 'pending', label: 'À vérifier', children: <PartnersTable status="attente" /> },
  { key: 'verified', label: 'Vérifiés', children: <PartnersTable status="verifie" /> },
  { key: 'suspended', label: 'Suspendus', children: <PartnersTable status="suspendu" /> },
  { key: 'refused', label: 'Refusés', children: <PartnersTable status="refuse" /> },
]

/** Fournisseurs de l'annuaire, vérifiés par les experts de l'équipe avant
 *  d'arriver chez les fermiers. */
export function SuppliersPage() {
  const { tab = 'pending' } = useParams()
  const navigate = useNavigate()
  return (
    <>
      <PageHeader
        title="Fournisseurs"
        subtitle="Fournisseurs vérifiés par les experts de l'équipe avant d'arriver chez les fermiers."
      />
      <Card>
        <Tabs activeKey={tab} items={TABS} onChange={(key) => navigate(`/suppliers/${key}`)} destroyOnHidden />
      </Card>
    </>
  )
}
