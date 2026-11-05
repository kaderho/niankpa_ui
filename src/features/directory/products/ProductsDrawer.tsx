import { Drawer, Tag } from 'antd'
import { useMemo } from 'react'

import type { Partner, Product } from '../../../api/types'
import { useCurrency } from '../../../shared/queries'
import { ReferenceTable } from '../../references/ReferenceTable'
import { categoryLabel, priceOf, useCategories } from '../labels'
import { ReviewActions, ReviewTag } from '../review/ReviewActions'
import { SheetFields } from './SheetFields'

/** Produits d'un fournisseur, avec leur prix : son étal sur le marché. */
export function ProductsDrawer({ partner, onClose }: { partner: Partner | null; onClose: () => void }) {
  const currency = useCurrency()
  const categories = useCategories()
  const params = useMemo(() => (partner ? { partner: partner.id } : undefined), [partner])

  return (
    <Drawer open={Boolean(partner)} onClose={onClose} size={860} title={partner && `Produits — ${partner.name}`} destroyOnHidden>
      {partner && (
        <ReferenceTable<Product>
          resource="products"
          noun="un produit"
          params={params}
          defaults={{ category: partner.categories[0], species: [] }}
          columns={[
            { title: 'Produit', dataIndex: 'name' },
            { title: 'Catégorie', dataIndex: 'category', render: (id: string) => categoryLabel(categories.byId.get(id)) },
            { title: 'Standard', dataIndex: 'standard_name', render: (v: string | null) => v ?? '—' },
            { title: 'Prix', align: 'right', render: (_, row) => priceOf(row, currency) },
            { title: 'Disponible', dataIndex: 'stock_quantity', align: 'right', render: (v: number | null) => v ?? '—' },
            {
              title: 'Vérification',
              render: (_, row) => (
                <>
                  <ReviewTag row={row} />
                  {row.certified && <Tag color="blue">Certifié</Tag>}
                </>
              ),
            },
          ]}
          rowActions={(product) => <ReviewActions resource="products" row={product} />}
          fields={<SheetFields forProduct currency={currency} />}
        />
      )}
    </Drawer>
  )
}
