import { ColorPicker, Form, Input, InputNumber, Select, Switch, Tag } from 'antd'
import type { Color } from 'antd/es/color-picker'

import type { Category } from '../../api/types'
import { useMeta } from '../../shared/queries'
import { ReferenceTable } from '../references/ReferenceTable'
import { labelOf } from './labels'

/** Catégories de l'annuaire : le back-office en ajoute à sa guise. Leur
 *  type de fiche dit quels champs ont leurs produits. */
export function CategoriesTab() {
  const { data: meta } = useMeta()
  return (
    <ReferenceTable<Category>
      resource="categories"
      noun="une catégorie"
      defaults={{ sheet: 'simple', color: '#64748B', verification_required: false }}
      columns={[
        {
          title: 'Nom',
          render: (_, row) => (
            <span>
              <span style={{ fontSize: 18, marginRight: 8 }}>{row.emoji}</span>
              <span style={{ color: row.color || undefined, fontWeight: 600 }}>{row.name}</span>
            </span>
          ),
        },
        { title: 'Type de fiche', dataIndex: 'sheet', render: (v: string) => labelOf(meta?.category_sheets, v) },
        {
          title: 'Vérification',
          dataIndex: 'verification_required',
          render: (v: boolean) => (v ? <Tag color="orange">Obligatoire</Tag> : 'Facultative'),
        },
        { title: 'Ordre', dataIndex: 'position', width: 80, align: 'right' },
      ]}
      fields={
        <>
          <Form.Item name="name" label="Nom" rules={[{ required: true }]}>
            <Input placeholder="Emballages, Transport, Services…" />
          </Form.Item>
          <Form.Item name="emoji" label="Emoji">
            <Input style={{ width: 120 }} maxLength={16} />
          </Form.Item>
          <Form.Item
            name="color"
            label="Couleur"
            getValueFromEvent={(color: Color) => color.toHexString().toUpperCase()}
          >
            <ColorPicker format="hex" disabledAlpha />
          </Form.Item>
          <Form.Item name="sheet" label="Type de fiche" rules={[{ required: true }]}
            extra="Les champs des produits, et ce que l'application en fait (préremplir un traitement, un lot…).">
            <Select options={meta?.category_sheets} />
          </Form.Item>
          <Form.Item name="verification_required" label="Vérification obligatoire" valuePropName="checked"
            extra="Ses produits ne partent qu'une fois vérifiés par un expert.">
            <Switch />
          </Form.Item>
          <Form.Item name="position" label="Ordre d'affichage">
            <InputNumber style={{ width: 120 }} />
          </Form.Item>
        </>
      }
    />
  )
}
