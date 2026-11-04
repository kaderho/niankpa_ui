import dayjs from 'dayjs'

const numbers = new Intl.NumberFormat('fr-FR')

export const formatNumber = (value: number | null | undefined) =>
  value == null ? '—' : numbers.format(value)

/** Montant suivi de la devise de la configuration globale. */
export const formatMoney = (value: number | null | undefined, currency = 'FCFA') =>
  value == null ? '—' : `${numbers.format(value)} ${currency}`.trim()

export const formatDate = (value: string | null | undefined) =>
  value ? dayjs(value).format('DD/MM/YYYY') : '—'

export const formatDateTime = (value: string | null | undefined) =>
  value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '—'

export const fromNow = (value: string | null | undefined) =>
  value ? dayjs(value).fromNow() : '—'
