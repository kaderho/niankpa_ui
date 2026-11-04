import { ShopOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, InputNumber, Select, Space, Switch, Tabs, Tag, Tooltip } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import type { Partner, ReviewStatus } from '../../api/types'
import { PageHeader } from '../../shared/PageHeader'
import { ReferenceTable } from '../references/ReferenceTable'
import { CategoriesTab } from './CategoriesTab'
import { categoryLabel, useCategories, usePartnerKinds } from './labels'
import { PartnerKindsTab } from './PartnerKindsTab'
import { ProductsDrawer } from './products/ProductsDrawer'
import { ProductsPendingTab } from './ProductsPendingTab'
import { ReportsTab } from './ReportsTab'
import { ReviewActions, ReviewTag } from './review/ReviewActions'

/** Fournisseurs à un stade de la vérification. */
function PartnersTable({ status }: { status: ReviewStatus }) {
  const kinds = usePartnerKinds()
  const [shop, setShop] = useState<Partner | null>(null)
  const params = useMemo(() => ({ status }), [status])
  const categories = useCategories()
  const kindLabel = (id: string | null) => {
    const kind = id ? kinds.byId.get(id) : undefined
    return kind ? `${kind.emoji} ${kind.name}`.trim() : '—'
  }

  return (
    <>
      <ReferenceTable<Partner>
        resource="partners"
        noun="un fournisseur"
        params={params}
        canAdd={status === 'attente'}
        defaults={{ radius_km: 0, categories: [], accredited: false }}
        columns={[
          { title: 'Nom', dataIndex: 'name' },
          {
            title: 'Catégories',
            dataIndex: 'categories',
            render: (ids: string[]) => ids.map((id) => <Tag key={id}>{categoryLabel(categories.byId.get(id))}</Tag>),
          },
          { title: 'Précision', dataIndex: 'precision', render: kindLabel },
          { title: 'Téléphone', dataIndex: 'phone1' },
          { title: 'Produits', dataIndex: 'products_count', align: 'right', width: 90 },
          {
            title: 'Vérification',
            render: (_, row) => (
              <>
                <ReviewTag row={row} />
                {row.accredited && <Tag color="blue">Agréé</Tag>}
                {row.latitude == null && <Tag color="orange">Sans position</Tag>}
              </>
            ),
          },
          ...(status === 'attente'
            ? [{ title: 'Proposé par', dataIndex: 'suggested_by_name', render: (v: string | null) => v ?? 'Back-office' }]
            : []),
        ]}
        rowActions={(partner) => (
          <>
            <ReviewActions resource="partners" row={partner} canSuspend />
            {!partner.deleted_at && (
              <Tooltip title="Ses produits">
                <Button type="text" icon={<ShopOutlined />} onClick={() => setShop(partner)} />
              </Tooltip>
            )}
          </>
        )}
        fields={
          <>
            <Form.Item name="name" label="Nom" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="categories" label="Catégories"
              extra="Il peut en avoir plusieurs ; celles de ses produits s'ajoutent d'elles-mêmes.">
              <Select mode="multiple" allowClear options={categories.options} />
            </Form.Item>
            <Form.Item name="precision" label="Précision"
              extra="Facultatif ; les précisions se gèrent dans l'onglet du même nom.">
              <Select allowClear options={kinds.options} />
            </Form.Item>
            <Space>
              <Form.Item name="phone1" label="Téléphone 1">
                <Input />
              </Form.Item>
              <Form.Item name="phone2" label="Téléphone 2">
                <Input />
              </Form.Item>
            </Space>
            <Form.Item name="address" label="Adresse">
              <Input />
            </Form.Item>
            <Space>
              <Form.Item name="latitude" label="Latitude" extra="Pour « le plus proche de ma ferme ».">
                <InputNumber min={-90} max={90} step={0.0001} style={{ width: 160 }} />
              </Form.Item>
              <Form.Item name="longitude" label="Longitude">
                <InputNumber min={-180} max={180} step={0.0001} style={{ width: 160 }} />
              </Form.Item>
            </Space>
            <Space>
              <Form.Item name="zone" label="Zone desservie">
                <Input placeholder="Bouaké et environs" />
              </Form.Item>
              <Form.Item name="radius_km" label="Rayon (km)" extra="0 : non précisé.">
                <InputNumber min={0} style={{ width: 120 }} />
              </Form.Item>
            </Space>
            <Space align="start">
              <Form.Item name="accreditation" label="Agrément officiel"
                extra="Pharmacie, Ordre des vétérinaires, couvoir. Obligatoire en santé.">
                <Input placeholder="N° d'agrément" />
              </Form.Item>
              <Form.Item name="accredited" label="Contrôlé" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Space>
            <Form.Item name="documents" label="Pièces contrôlées (privé)"
              extra="Registre de commerce, identité du responsable… Jamais envoyé aux fermes.">
              <Input.TextArea rows={2} />
            </Form.Item>
            <Space align="start">
              <Form.Item name="visited_at" label="Visité le">
                <Input type="date" style={{ width: 180 }} />
              </Form.Item>
              <Form.Item name="listed_until" label="Forfait jusqu'au"
                extra="Passé ce jour, les fermes ne le voient plus. Vide : sans fin.">
                <Input type="date" style={{ width: 180 }} />
              </Form.Item>
            </Space>
          </>
        }
      />
      <ProductsDrawer partner={shop} onClose={() => setShop(null)} />
    </>
  )
}

const TABS = [
  { key: 'pending', label: 'À vérifier', children: <PartnersTable status="attente" /> },
  { key: 'verified', label: 'Vérifiés', children: <PartnersTable status="verifie" /> },
  { key: 'suspended', label: 'Suspendus', children: <PartnersTable status="suspendu" /> },
  { key: 'refused', label: 'Refusés', children: <PartnersTable status="refuse" /> },
  { key: 'products', label: 'Produits à vérifier', children: <ProductsPendingTab /> },
  { key: 'reports', label: 'Signalements', children: <ReportsTab /> },
  { key: 'categories', label: 'Catégories', children: <CategoriesTab /> },
  { key: 'kinds', label: 'Précisions', children: <PartnerKindsTab /> },
]

/** Annuaire et marché : les fournisseurs et leurs produits, vérifiés par les
 *  experts de l'équipe avant d'arriver chez les fermiers. */
export function PartnersPage() {
  const { tab = 'pending' } = useParams()
  const navigate = useNavigate()
  return (
    <>
      <PageHeader
        title="Annuaire et marché"
        subtitle="Fournisseurs et produits vérifiés par les experts de l'équipe avant d'arriver chez les fermiers."
      />
      <Card>
        <Tabs activeKey={tab} items={TABS} onChange={(key) => navigate(`/partners/${key}`)} destroyOnHidden />
      </Card>
    </>
  )
}
