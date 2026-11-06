import { SafetyCertificateOutlined, ShopOutlined } from '@ant-design/icons'
import { Button, Form, Input, InputNumber, Select, Space, Switch, Tag, Tooltip } from 'antd'
import { useMemo, useState } from 'react'

import type { Partner, ReviewStatus } from '../../api/types'
import { LocalitySelect } from '../../shared/LocalitySelect'
import { ReferenceTable } from '../references/ReferenceTable'
import { categoryLabel, useCategories, usePartnerKinds } from './labels'
import { ProductsDrawer } from './products/ProductsDrawer'
import { ConsentTag, PartnerCheck } from './review/PartnerCheck'
import { ReviewActions, ReviewTag } from './review/ReviewActions'

/** Fournisseurs à un stade de la vérification. */
export function PartnersTable({ status }: { status: ReviewStatus }) {
  const kinds = usePartnerKinds()
  const [shop, setShop] = useState<Partner | null>(null)
  const [checking, setChecking] = useState<Partner | null>(null)
  const params = useMemo(() => ({ status }), [status])
  const categories = useCategories()
  const today = new Date().toISOString().slice(0, 10)
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
          { title: 'Localité', dataIndex: 'place_label', render: (v: string | null) => v ?? '—' },
          { title: 'Produits', dataIndex: 'products_count', align: 'right', width: 90 },
          {
            title: 'Vérification',
            render: (_, row) => (
              <>
                <ReviewTag row={row} />
                {row.status === 'attente' && <ConsentTag partner={row} />}
                {row.accredited && <Tag color="blue">Agréé</Tag>}
                {row.featured_until && row.featured_until >= today && (
                  <Tag color="gold">Sponsorisé jusqu'au {row.featured_until}</Tag>
                )}
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
            {!partner.deleted_at && partner.status === 'attente' && (
              <Tooltip title="Accord et doublons">
                <Button type="text" icon={<SafetyCertificateOutlined />} onClick={() => setChecking(partner)} />
              </Tooltip>
            )}
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
            <Form.Item noStyle shouldUpdate={(a, b) => a.place_label !== b.place_label}>
              {(form) => (
                <Form.Item name="place" label="Localité"
                  extra="Vide : la plus proche de la position ci-dessous, à l'enregistrement.">
                  <LocalitySelect label={form.getFieldValue('place_label')} />
                </Form.Item>
              )}
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
              <Form.Item name="featured_until" label="Sponsorisé jusqu'au"
                extra="Mise en avant payée : il passe en tête chez les fermes de sa zone. Vide : aucune.">
                <Input type="date" style={{ width: 180 }} />
              </Form.Item>
            </Space>
          </>
        }
      />
      <ProductsDrawer partner={shop} onClose={() => setShop(null)} />
      <PartnerCheck partner={checking} onClose={() => setChecking(null)} />
    </>
  )
}
