import type { Section } from '../../api/types'

/** Rubriques rangées par section du menu, dans l'ordre de l'API. */
export function byMenu(sections: Section[]) {
  const groups = new Map<string, Section[]>()
  for (const section of sections) {
    groups.set(section.menu, [...(groups.get(section.menu) ?? []), section])
  }
  return [...groups.entries()]
}

/** Libellé d'une rubrique, ou sa clé si elle est inconnue. */
export function sectionLabel(sections: Section[], key: string) {
  return sections.find((section) => section.key === key)?.label ?? key
}
