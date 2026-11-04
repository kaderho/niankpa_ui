import { Form, Input, InputNumber, Select } from 'antd'

import type { PartnerKind } from '../../api/types'
import { useMeta } from '../../shared/queries'
import { ReferenceTable } from '../references/ReferenceTable'
import { categoryLabel, labelOf, useCategories } from './labels'

/** Précisions des fournisseurs (pharmacie vétérinaire, couvoir…) : on en
 *  ajoute à sa guise. Chacune donne sa catégorie à un nouveau fournisseur,
 *  et sa correspondance dans le carnet d'adresses des fermes. */
export function PartnerKindsTab() {
  const { data: meta } = useMeta()
  const categories = useCategories()
  return (
    <ReferenceTable<PartnerKind>
      resource="partner-kinds"
      noun="une précision"
      defaults={{ contact_category: 'autre' }}
      columns={[
        {
          title: 'Nom',
          render: (_, row) => `${row.emoji} ${row.name}`.trim(),
        },
        {
          title: 'Catégorie par défaut',
          dataIndex: 'default_category',
          render: (id: string | null) => (id ? categoryLabel(categories.byId.get(id)) : '—'),
        },
        {
          title: 'Dans le carnet',
          dataIndex: 'contact_category',
          render: (v: string) => labelOf(meta?.contact_categories, v),
        },
        { title: 'Ordre', dataIndex: 'position', width: 80, align: 'right' },
      ]}
      fields={
        <>
          <Form.Item name="name" label="Nom" rules={[{ required: true }]}>
            <Input placeholder="Transporteur, provenderie, abattoir…" />
          </Form.Item>
          <Form.Item name="emoji" label="Emoji">
            <Input style={{ width: 120 }} maxLength={16} />
          </Form.Item>
          <Form.Item name="default_category" label="Catégorie par défaut"
            extra="Celle que prend un nouveau fournisseur de cette précision.">
            <Select allowClear options={categories.options} />
          </Form.Item>
          <Form.Item name="contact_category" label="Correspondance dans le carnet"
            extra="Le fournisseur copié dans le carnet d'une ferme y prend cette catégorie ; un contact de cette catégorie peut être proposé à l'annuaire.">
            <Select options={meta?.contact_categories} />
          </Form.Item>
          <Form.Item name="position" label="Ordre d'affichage">
            <InputNumber style={{ width: 120 }} />
          </Form.Item>
        </>
      }
    />
  )
}
