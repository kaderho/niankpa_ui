import { CopyOutlined, LineChartOutlined } from '@ant-design/icons'
import { Button, Popconfirm, Tag, Tooltip } from 'antd'
import { useState } from 'react'

import { api } from '../../../api/client'
import type { Breed } from '../../../api/types'
import { formatDate, formatMoney } from '../../../shared/format'
import { useAction, useCurrency, useMeta } from '../../../shared/queries'
import { labelOf } from '../../directory/labels'
import { ReferenceTable } from '../ReferenceTable'
import { BreedDrawer } from './BreedDrawer'
import { BreedFields } from './BreedFields'

const RELIABILITY_COLORS: Record<string, string> = {
  selectionneur: 'green',
  terrain: 'blue',
  estimation: 'orange',
}

/** Fiches techniques des souches : le simulateur de bande des fermes s'en
 *  sert pour estimer un cycle. */
export function BreedsTab() {
  const { data: meta } = useMeta()
  const currency = useCurrency()
  const [opened, setOpened] = useState<Breed | null>(null)
  const duplicate = useAction('breeds', (id) => api('post', `/bo/breeds/${id}/duplicate/`), {
    success: 'Fiche dupliquée.',
  })

  return (
    <>
      <ReferenceTable<Breed>
        resource="breeds"
        noun="une souche"
        defaults={{
          breed_type: 'chair',
          purpose: 'chair',
          reliability: 'estimation',
          sale_unit: 'sujet',
          mortality_low_percent: 3,
          mortality_high_percent: 8,
        }}
        columns={[
          { title: 'Nom', dataIndex: 'name' },
          { title: 'Espèce', dataIndex: 'species_name' },
          { title: 'Type', dataIndex: 'breed_type', render: (v: string) => labelOf(meta?.breed_types, v) },
          {
            title: 'Fiabilité',
            dataIndex: 'reliability',
            render: (v: string) => <Tag color={RELIABILITY_COLORS[v]}>{labelOf(meta?.breed_reliabilities, v)}</Tag>,
          },
          { title: 'Vente', dataIndex: 'sale_age_days', render: (d: number | null) => (d ? `${d} j` : '—') },
          {
            title: 'Prix indicatif',
            render: (_, row) =>
              row.sale_price == null ? '—' : (
                <Tooltip title={`Posé le ${formatDate(row.sale_price_at)}`}>
                  {formatMoney(row.sale_price, currency)} / {labelOf(meta?.sale_units, row.sale_unit)}
                </Tooltip>
              ),
          },
          { title: 'Semaines', dataIndex: 'weeks_count', align: 'right', width: 90 },
        ]}
        rowActions={(breed) =>
          !breed.deleted_at && (
            <>
              <Tooltip title="Courbe et programme alimentaire">
                <Button type="text" icon={<LineChartOutlined />} onClick={() => setOpened(breed)} />
              </Tooltip>
              <Popconfirm
                title="Dupliquer cette fiche ?"
                description="La copie reprend la courbe et le programme alimentaire."
                okText="Dupliquer"
                onConfirm={() => duplicate.mutate(breed.id)}
              >
                <Tooltip title="Dupliquer">
                  <Button type="text" icon={<CopyOutlined />} />
                </Tooltip>
              </Popconfirm>
            </>
          )
        }
        fields={<BreedFields />}
      />
      <BreedDrawer breed={opened} onClose={() => setOpened(null)} />
    </>
  )
}
