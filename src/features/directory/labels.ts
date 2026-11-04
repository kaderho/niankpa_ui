import type { Category, Choice, Product, Reference } from '../../api/types'
import { formatMoney } from '../../shared/format'
import { useList } from '../../shared/queries'

export const labelOf = (choices: Choice[] | undefined, value: string | null) =>
  value ? (choices?.find((c) => c.value === value)?.label ?? value) : '—'

export const categoryLabel = (category: Category | undefined) =>
  category ? `${category.emoji} ${category.name}`.trim() : '—'

/** Catégories actives, pour les listes de choix. */
export function useCategories() {
  const { data = [] } = useList<Category[]>('categories')
  const active = data.filter((c) => !c.deleted_at)
  return {
    all: data,
    options: active.map((c) => ({ value: c.id, label: categoryLabel(c) })),
    byId: new Map(data.map((c) => [c.id, c])),
  }
}

/** Espèces actives ; aucune choisie = toutes les volailles. */
export function useSpeciesOptions() {
  const { data = [] } = useList<Reference[]>('species')
  return data.filter((s) => !s.deleted_at).map((s) => ({ value: s.id, label: s.name }))
}

/** Prix et unité, ou « À demander ». */
export const priceOf = (product: Product, currency: string) =>
  product.price == null ? 'À demander' : `${formatMoney(product.price, currency)} ${product.unit}`.trim()
