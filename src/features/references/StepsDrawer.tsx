import { Drawer, Form, Input, InputNumber, Select, Tag } from 'antd'
import { useMemo } from 'react'

import type { Program, Step } from '../../api/types'
import { useMeta } from '../../shared/queries'
import { ReferenceTable } from './ReferenceTable'

/** Étapes d'un programme type : quoi faire, à quel jour d'âge. */
export function StepsDrawer({ program, onClose }: { program: Program | null; onClose: () => void }) {
  const { data: meta } = useMeta()
  const params = useMemo(() => (program ? { program: program.id } : undefined), [program])
  const label = (choices: { value: string; label: string }[] | undefined, value: string | null) =>
    value ? (choices?.find((c) => c.value === value)?.label ?? value) : '—'

  return (
    <Drawer open={Boolean(program)} onClose={onClose} size={760} title={program?.name} destroyOnHidden>
      {program && (
        <ReferenceTable<Step>
          resource="program-steps"
          noun="une étape"
          params={params}
          defaults={{ kind: 'vaccin' }}
          columns={[
            { title: 'Jour', dataIndex: 'age_day', width: 70, render: (d: number) => <Tag>J{d}</Tag> },
            { title: 'Soin', dataIndex: 'name' },
            { title: 'Type', dataIndex: 'kind', render: (v: string) => label(meta?.health_kinds, v) },
            { title: 'Voie', dataIndex: 'route', render: (v: string | null) => label(meta?.routes, v) },
          ]}
          fields={
            <>
              <Form.Item name="age_day" label="Jour d'âge" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: 120 }} />
              </Form.Item>
              <Form.Item name="name" label="Soin" rules={[{ required: true }]}>
                <Input placeholder="Vaccin Newcastle, vitamines…" />
              </Form.Item>
              <Form.Item name="kind" label="Type" rules={[{ required: true }]}>
                <Select options={meta?.health_kinds} />
              </Form.Item>
              <Form.Item name="route" label="Voie d'administration">
                <Select allowClear options={meta?.routes} />
              </Form.Item>
            </>
          }
        />
      )}
    </Drawer>
  )
}
