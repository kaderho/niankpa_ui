import type { Product } from '../../api/types'
import { useCurrency } from '../../shared/queries'
import { ReferenceTable } from '../references/ReferenceTable'
import { categoryLabel, priceOf, useCategories } from './labels'
import { SheetFields } from './products/SheetFields'
import { ReviewActions } from './review/ReviewActions'

const PARAMS = { status: 'attente' }

/** Produits qui attendent l'expert : ceux d'une catégorie à vérification
 *  obligatoire, et ceux qui ont changé depuis leur vérification. */
export function ProductsPendingTab() {
  const currency = useCurrency()
  const categories = useCategories()
  return (
    <ReferenceTable<Product>
      resource="products"
      noun="un produit"
      params={PARAMS}
      canAdd={false}
      columns={[
        { title: 'Produit', dataIndex: 'name' },
        { title: 'Fournisseur', dataIndex: 'partner_name' },
        { title: 'Catégorie', dataIndex: 'category', render: (id: string) => categoryLabel(categories.byId.get(id)) },
        { title: 'Standard', dataIndex: 'standard_name', render: (v: string | null) => v ?? '—' },
        { title: 'Certification', dataIndex: 'certification', render: (v: string) => v || '—' },
        { title: 'Prix', align: 'right', render: (_, row) => priceOf(row, currency) },
      ]}
      rowActions={(product) => <ReviewActions resource="products" row={product} />}
      fields={<SheetFields forProduct currency={currency} />}
    />
  )
}
