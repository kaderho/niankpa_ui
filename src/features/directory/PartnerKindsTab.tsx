import { Form, Input, InputNumber, Select } from 'antd'

import type { PartnerKind } from '../../api/types'
import { PictogramSelect } from '../../shared/PictogramSelect'
import { picto, usePictograms } from '../../shared/pictograms'
import { ReferenceTable } from '../references/ReferenceTable'
import { categoryLabel, useCategories } from './labels'

/** Précisions (pharmacie vétérinaire, couvoir…) : on en ajoute à sa guise.
 *  La même liste range l'annuaire et le carnet d'adresses des fermes ;
 *  chacune donne sa catégorie à un nouveau fournisseur. */
export function PartnerKindsTab() {
  const categories = useCategories()
  usePictograms()
  return (
    <ReferenceTable<PartnerKind>
      resource="partner-kinds"
      noun="une précision"
      columns={[
        {
          title: 'Nom',
          render: (_, row) => `${picto(row.emoji)} ${row.name}`.trim(),
        },
        {
          title: 'Catégorie par défaut',
          dataIndex: 'default_category',
          render: (id: string | null) => (id ? categoryLabel(categories.byId.get(id)) : '—'),
        },
        { title: 'Ordre', dataIndex: 'position', width: 80, align: 'right' },
      ]}
      fields={
        <>
          <Form.Item name="name" label="Nom" rules={[{ required: true }]}>
            <Input placeholder="Transporteur, provenderie, abattoir…" />
          </Form.Item>
          <Form.Item name="emoji" label="Pictogramme">
            <PictogramSelect />
          </Form.Item>
          <Form.Item name="default_category" label="Catégorie par défaut"
            extra="Celle que prend un nouveau fournisseur de cette précision.">
            <Select allowClear options={categories.options} />
          </Form.Item>
          <Form.Item name="position" label="Ordre d'affichage">
            <InputNumber style={{ width: 120 }} />
          </Form.Item>
        </>
      }
    />
  )
}
