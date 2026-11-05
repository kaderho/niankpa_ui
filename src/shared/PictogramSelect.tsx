import { Select } from 'antd'

import { picto, usePictograms } from './pictograms'

/** Choix d'un pictogramme, avec recherche par nom (« egg », « chick »…). */
export function PictogramSelect(props: { value?: string; onChange?: (value: string) => void }) {
  const options = usePictograms()
  return (
    <Select
      {...props}
      showSearch
      allowClear
      style={{ width: 260 }}
      placeholder="Choisir un pictogramme"
      options={options}
      optionFilterProp="label"
    />
  )
}

/** Aperçu d'un pictogramme dans une liste. */
export function Pictogram({ value }: { value?: string | null }) {
  usePictograms()
  return <span style={{ fontSize: 18, marginRight: 8 }}>{picto(value)}</span>
}
