import type { Category, Choice, PartnerKind, Product, Reference } from '../../api/types'
import { formatMoney } from '../../shared/format'
import { picto, usePictograms } from '../../shared/pictograms'
import { useList } from '../../shared/queries'

export const labelOf = (choices: Choice[] | undefined, value: string | null) =>
  value ? (choices?.find((c) => c.value === value)?.label ?? value) : '—'

export const categoryLabel = (category: Category | undefined) =>
  category ? `${picto(category.emoji)} ${category.name}`.trim() : '—'

/** Catégories actives, pour les listes de choix. */
export function useCategories() {
  usePictograms()
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

/** Précisions des fournisseurs, tenues dans le back-office. */
export function usePartnerKinds() {
  usePictograms()
  const { data = [] } = useList<PartnerKind[]>('partner-kinds')
  const active = data.filter((k) => !k.deleted_at)
  return {
    options: active.map((k) => ({ value: k.id, label: `${picto(k.emoji)} ${k.name}`.trim() })),
    byId: new Map(data.map((k) => [k.id, k])),
  }
}
