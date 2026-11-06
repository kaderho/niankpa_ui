import { Empty, Form, InputNumber, Segmented, Tag, Tooltip } from 'antd'
import { useState } from 'react'

import type { Standard } from '../../api/types'
import { formatDate, formatMoney } from '../../shared/format'
import { useCurrency } from '../../shared/queries'
import { categoryLabel, useCategories } from '../directory/labels'
import { SheetFields } from '../directory/products/SheetFields'
import { ReferenceTable } from './ReferenceTable'

/** Standards de la plateforme, par catégorie : des repères sans produit ni
 *  prix, qui préremplissent les formulaires des fermes et mènent aux
 *  produits qui s'y rattachent. */
export function StandardsTab() {
  const categories = useCategories()
  const currency = useCurrency()
  const active = categories.all.filter((c) => !c.deleted_at)
  const [chosen, setChosen] = useState<string>()
  const category = active.find((c) => c.id === chosen) ?? active[0]
  if (!category) return <Empty description="Créez d'abord une catégorie, dans l'Annuaire." />

  return (
    <>
      <Segmented
        style={{ marginBottom: 16 }}
        value={category.id}
        onChange={(value) => setChosen(String(value))}
        options={active.map((c) => ({ value: c.id, label: categoryLabel(c) }))}
      />
      <ReferenceTable<Standard>
        key={category.id}
        resource="standards"
        noun="un standard"
        params={{ category: category.id }}
        defaults={{ category: category.id, species: [] }}
        columns={[
          { title: 'Nom', dataIndex: 'name' },
          ...(category.sheet === 'medicament'
            ? [{
                title: "Délai d'attente",
                dataIndex: 'withdrawal_days',
                render: (d: number | null) => (d ? <Tag color="orange">{d} j</Tag> : 'Aucun'),
              }]
            : []),
          ...(category.sheet === 'sujet' ? [{ title: 'Souche', dataIndex: 'strain' }] : []),
          { title: 'Espèces', dataIndex: 'species', render: (ids: string[]) => (ids.length ? ids.length : 'Toutes') },
          {
            title: 'Prix indicatif',
            render: (_, row) =>
              row.indicative_price == null ? '—' : (
                <Tooltip title={`Posé le ${formatDate(row.indicative_price_at)}`}>
                  {formatMoney(row.indicative_price, currency)} {row.unit}
                </Tooltip>
              ),
          },
          { title: 'Ordre', dataIndex: 'position', width: 80, align: 'right' as const },
        ]}
        fields={
          <>
            <SheetFields />
            <Form.Item
              name="indicative_price"
              label={`Prix indicatif (${currency}, par unité)`}
              extra="Pour le simulateur, quand ni la ferme ni les fournisseurs n'en donnent ; le fermier le voit comme un repère qui peut différer du marché."
            >
              <InputNumber min={0} step={100} style={{ width: 200 }} />
            </Form.Item>
          </>
        }
      />
    </>
  )
}
