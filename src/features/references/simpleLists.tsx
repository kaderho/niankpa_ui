import { Form, Input, InputNumber } from 'antd'

import type { Reference } from '../../api/types'
import { ReferenceTable } from './ReferenceTable'

const nameColumn = {
  title: 'Nom',
  render: (_: unknown, row: Reference) => (
    <span>
      <span style={{ fontSize: 18, marginRight: 8 }}>{String(row.emoji ?? '')}</span>
      {row.name}
    </span>
  ),
}
const positionColumn = { title: 'Ordre', dataIndex: 'position', width: 80, align: 'right' as const }

const commonFields = (
  <>
    <Form.Item name="name" label="Nom" rules={[{ required: true }]}>
      <Input />
    </Form.Item>
    <Form.Item name="emoji" label="Emoji" rules={[{ required: true }]}>
      <Input style={{ width: 120 }} maxLength={16} />
    </Form.Item>
  </>
)
const positionField = (
  <Form.Item name="position" label="Ordre d'affichage">
    <InputNumber style={{ width: 120 }} />
  </Form.Item>
)

export function SpeciesList() {
  return (
    <ReferenceTable
      resource="species"
      noun="une espèce"
      columns={[nameColumn, { title: "Durée d'incubation", dataIndex: 'incubation_days', render: (d: number) => `${d} jours` }, positionColumn]}
      defaults={{ incubation_days: 21 }}
      fields={
        <>
          {commonFields}
          <Form.Item name="incubation_days" label="Durée d'incubation (jours)" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: 120 }} />
          </Form.Item>
          {positionField}
        </>
      }
    />
  )
}

const every = (days: number) =>
  days === 1 ? 'Chaque jour' : days === 7 ? 'Chaque semaine' : `Tous les ${days} jours`

export function BiosecurityList() {
  return (
    <ReferenceTable
      resource="biosecurity-items"
      noun="un point de contrôle"
      columns={[nameColumn, { title: 'Fréquence', dataIndex: 'frequency_days', render: every }, positionColumn]}
      defaults={{ frequency_days: 1 }}
      fields={
        <>
          {commonFields}
          <Form.Item name="frequency_days" label="À refaire tous les … jours" rules={[{ required: true }]}
            extra="1 = chaque jour, 7 = chaque semaine.">
            <InputNumber min={1} style={{ width: 120 }} />
          </Form.Item>
          {positionField}
        </>
      }
    />
  )
}

export function EggCriteriaList() {
  return (
    <ReferenceTable
      resource="egg-criteria"
      noun="un critère"
      columns={[nameColumn, positionColumn]}
      fields={
        <>
          {commonFields}
          {positionField}
        </>
      }
    />
  )
}
