import type { Breed, BreedWeek } from '../../../api/types'

const COLUMNS = [
  'week', 'weight_g', 'weight_min_g', 'weight_max_g', 'feed_g_day', 'water_ml_day', 'lay_percent', 'egg_weight_g',
] as const

/** Télécharge la courbe au format de l'import (séparateur `;`), pour la
 *  retoucher dans un tableur et la recoller. */
export function downloadWeeks(breed: Breed, weeks: BreedWeek[]) {
  const rows = weeks.filter((w) => !w.deleted_at).sort((a, b) => a.week - b.week)
  const lines = [
    COLUMNS.join(';'),
    ...rows.map((w) => COLUMNS.map((c) => (w[c] == null ? '' : String(w[c]).replace('.', ','))).join(';')),
  ]
  const blob = new Blob([`﻿${lines.join('\n')}\n`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `courbe-${breed.name.replace(/[^\p{L}\p{N}]+/gu, '-').toLowerCase()}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
