import { useQuery } from '@tanstack/react-query'
import { Select } from 'antd'
import { useEffect, useState } from 'react'

import { api } from '../api/client'
import type { Locality, Page } from '../api/types'

interface Props {
  value?: number | null
  onChange?: (value: number | null) => void
  /** Libellé de la localité déjà choisie, pour l'afficher sans la chercher. */
  label?: string | null
  placeholder?: string
  style?: React.CSSProperties
}

/** Choix d'une localité parmi des milliers : la recherche se fait côté
 *  serveur, les plus peuplées d'abord. */
export function LocalitySelect({ value, onChange, label, placeholder, style }: Props) {
  const [typed, setTyped] = useState('')
  const [search, setSearch] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setSearch(typed.trim()), 300)
    return () => clearTimeout(timer)
  }, [typed])
  const { data, isFetching } = useQuery({
    queryKey: ['localities', { search, page_size: 30 }],
    queryFn: () => api<Page<Locality>>('get', '/bo/localities/', undefined, { search, page_size: 30 }),
    placeholderData: (previous) => previous,
  })
  const options = (data?.results ?? []).map((l) => ({ value: l.id, label: l.label }))
  if (value != null && label && !options.some((o) => o.value === value)) {
    options.unshift({ value, label })
  }
  return (
    <Select
      showSearch
      allowClear
      value={value ?? undefined}
      onChange={(next) => onChange?.(next ?? null)}
      onSearch={setTyped}
      filterOption={false}
      loading={isFetching}
      options={options}
      placeholder={placeholder ?? 'Chercher une localité'}
      notFoundContent={isFetching ? 'Recherche…' : 'Aucune localité'}
      style={{ minWidth: 260, ...style }}
    />
  )
}
