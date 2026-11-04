import { OrderedListOutlined } from '@ant-design/icons'
import { Button, Form, Input, InputNumber, Select, Tooltip } from 'antd'
import { useState } from 'react'

import type { Program, Reference } from '../../api/types'
import { useList, useMeta } from '../../shared/queries'
import { ReferenceTable } from './ReferenceTable'
import { StepsDrawer } from './StepsDrawer'

/** Programmes de prophylaxie types, communs à toutes les fermes. */
export function ProgramsList() {
  const { data: meta } = useMeta()
  const { data: species = [] } = useList<Reference[]>('species')
  const [opened, setOpened] = useState<Program | null>(null)
  const purposeLabel = (value: string | null) =>
    value ? (meta?.purposes.find((p) => p.value === value)?.label ?? value) : 'Par défaut'

  return (
    <>
      <ReferenceTable<Program>
        resource="programs"
        noun="un programme"
        columns={[
          { title: 'Nom', dataIndex: 'name' },
          { title: 'Espèce', dataIndex: 'species_name' },
          { title: 'Destination', dataIndex: 'purpose', render: purposeLabel },
          { title: 'Étapes', dataIndex: 'steps_count', align: 'right', width: 80 },
        ]}
        rowActions={(program) =>
          !program.deleted_at && (
            <Tooltip title="Étapes du programme">
              <Button type="text" icon={<OrderedListOutlined />} onClick={() => setOpened(program)} />
            </Tooltip>
          )
        }
        fields={
          <>
            <Form.Item name="name" label="Nom" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="species" label="Espèce" rules={[{ required: true }]}>
              <Select options={species.filter((s) => !s.deleted_at).map((s) => ({ value: s.id, label: s.name }))} />
            </Form.Item>
            <Form.Item name="purpose" label="Destination" extra="Vide : programme par défaut de l'espèce.">
              <Select allowClear options={meta?.purposes} />
            </Form.Item>
            <Form.Item name="position" label="Ordre d'affichage">
              <InputNumber style={{ width: 120 }} />
            </Form.Item>
          </>
        }
      />
      <StepsDrawer program={opened} onClose={() => setOpened(null)} />
    </>
  )
}
