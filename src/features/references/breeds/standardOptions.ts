import type { Standard } from '../../../api/types'
import { useList } from '../../../shared/queries'
import { useCategories } from '../../directory/labels'

/** Standards d'un type de fiche (« sujet », « aliment »), pour un choix. */
export function useStandardOptions(sheet: string) {
  const categories = useCategories()
  const { data = [] } = useList<Standard[]>('standards')
  return data
    .filter((s) => !s.deleted_at && categories.byId.get(s.category)?.sheet === sheet)
    .map((s) => ({ value: s.id, label: s.unit ? `${s.name} (${s.unit})` : s.name }))
}
