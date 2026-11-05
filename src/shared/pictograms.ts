import { useMeta } from './queries'

/**
 * Pictogrammes : une clé (`egg`, `chicken`…), le nom du dessin sur le
 * téléphone. Le back-office n'a pas les dessins : il montre l'emoji
 * équivalent, reçu avec les listes de choix (`/bo/meta/`).
 */
const table = new Map<string, string>()

/** Emoji d'une clé, pour l'aperçu ; une valeur inconnue reste telle quelle. */
export const picto = (key?: string | null) => (key ? (table.get(key) ?? key) : '')

/** Charge la table des pictogrammes et rend les choix du sélecteur. */
export function usePictograms() {
  const { data } = useMeta()
  for (const { key, emoji } of data?.pictograms ?? []) table.set(key, emoji)
  return (data?.pictograms ?? []).map(({ key, emoji }) => ({
    value: key,
    label: `${emoji}  ${key.replaceAll('_', ' ')}`,
  }))
}
