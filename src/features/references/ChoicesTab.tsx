import type { Color } from 'antd/es/color-picker'
import { Alert, ColorPicker, Empty, Form, Input, InputNumber, Select, Tag, Tooltip, Typography } from 'antd'
import { useState } from 'react'

import type { ChoiceItem, ChoiceList } from '../../api/types'
import { Pictogram, PictogramSelect } from '../../shared/PictogramSelect'
import { useMeta } from '../../shared/queries'
import { ReferenceTable } from './ReferenceTable'

const KIND_LABEL = { free: 'Listes libres', behaviour: 'Listes à comportement' }

const KIND_HELP = {
  free: "Des étiquettes : libellé, pictogramme, couleur et ordre se modifient à volonté.",
  behaviour:
    "L'application agit selon la clé : une clé ajoutée reste « à venir » jusqu'à la version de l'application qui la gère.",
}

/** Statut d'un élément : d'origine, à venir, à partir d'une version. */
function ChoiceTags({ row }: { row: ChoiceItem }) {
  return (
    <>
      {row.system && <Tag>Système</Tag>}
      {!row.supported && (
        <Tooltip title="Visible mais pas encore sélectionnable : l'application ne sait pas encore quoi en faire.">
          <Tag color="gold">À venir</Tag>
        </Tooltip>
      )}
      {row.min_app_version && <Tag color="blue">Dès la version {row.min_app_version}</Tag>}
    </>
  )
}

/** Listes de choix des formulaires : conditionnements, destinations de
 *  lot, voies d'administration… Les clés ne changent jamais ; tout le reste
 *  se modifie et redescend sur les téléphones à la synchro. */
export function ChoicesTab() {
  const { data: meta } = useMeta()
  const lists = meta?.choice_lists ?? []
  const [chosen, setChosen] = useState<string>()
  const list: ChoiceList | undefined = lists.find((l) => l.key === chosen) ?? lists[0]
  if (!list) return <Empty />

  const options = (['free', 'behaviour'] as const).map((kind) => ({
    label: KIND_LABEL[kind],
    options: lists.filter((l) => l.kind === kind).map((l) => ({ value: l.key, label: l.label })),
  }))
  const opensLater = list.kind === 'free' && !list.open

  return (
    <>
      <Select
        style={{ width: 320, marginBottom: 12 }}
        value={list.key}
        onChange={setChosen}
        options={options}
        showSearch
        optionFilterProp="label"
      />
      <Typography.Paragraph type="secondary">
        Sert à : {list.used_in}. {KIND_HELP[list.kind]}
      </Typography.Paragraph>
      {opensLater && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="Les éléments ajoutés à cette liste restent « à venir » jusqu'à la prochaine version de l'application mobile."
        />
      )}
      <ReferenceTable<ChoiceItem>
        key={list.key}
        resource="choices"
        noun="un élément"
        params={{ list: list.key }}
        defaults={{ list_key: list.key, extra: {} }}
        invalidate={['meta']}
        columns={[
          {
            title: 'Libellé',
            render: (_, row) => (
              <span style={{ borderLeft: row.color ? `4px solid ${row.color}` : undefined, paddingLeft: 8 }}>
                <Pictogram value={row.emoji} />
                {row.name}
              </span>
            ),
          },
          { title: 'Clé', dataIndex: 'key', render: (key: string) => <Typography.Text code>{key}</Typography.Text> },
          ...(list.key === 'medicine_kind'
            ? [{
                title: 'Acte de santé',
                render: (_: unknown, row: ChoiceItem) =>
                  meta?.health_kinds.find((k) => k.value === row.extra?.health_kind)?.label ?? '—',
              }]
            : []),
          { title: 'Statut', render: (_, row) => <ChoiceTags row={row} /> },
          { title: 'Ordre', dataIndex: 'position', width: 80, align: 'right' as const },
        ]}
        fields={
          <>
            <Form.Item name="id" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="list_key" hidden>
              <Input />
            </Form.Item>
            <Form.Item noStyle shouldUpdate={(a, b) => a.id !== b.id}>
              {({ getFieldValue }) => (
                <Form.Item
                  name="key"
                  label="Clé"
                  extra="Minuscules, chiffres et « _ ». Elle ne change plus une fois créée."
                  rules={[{ required: true }, { pattern: /^[a-z][a-z0-9_]*$/, message: 'Format : ponte_bio' }]}
                >
                  <Input disabled={Boolean(getFieldValue('id'))} />
                </Form.Item>
              )}
            </Form.Item>
            <Form.Item name="name" label="Libellé" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="emoji" label="Pictogramme">
              <PictogramSelect />
            </Form.Item>
            <Form.Item
              name="color"
              label="Couleur"
              getValueFromEvent={(color: Color) => (color.cleared ? '' : color.toHexString().toUpperCase())}
            >
              <ColorPicker allowClear format="hex" disabledAlpha showText />
            </Form.Item>
            {list.key === 'medicine_kind' && (
              <Form.Item name={['extra', 'health_kind']} label="Acte de santé correspondant">
                <Select options={meta?.health_kinds} style={{ width: 220 }} />
              </Form.Item>
            )}
            <Form.Item
              name="min_app_version"
              label="Version minimale de l'application"
              extra="Vide : toutes les versions. Exemple : 1.4.0"
              rules={[{ pattern: /^(\d+\.\d+\.\d+)?$/, message: 'Format : 1.4.0' }]}
            >
              <Input style={{ width: 160 }} />
            </Form.Item>
            <Form.Item name="position" label="Ordre d'affichage">
              <InputNumber style={{ width: 120 }} />
            </Form.Item>
          </>
        }
      />
    </>
  )
}
