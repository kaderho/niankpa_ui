import { Form, Input, InputNumber, Select, Space, Switch } from 'antd'

import type { Standard } from '../../../api/types'
import { useList, useMeta } from '../../../shared/queries'
import { useCategories, useSpeciesOptions } from '../labels'

interface Props {
  /** Produit d'un fournisseur ; sinon un standard de la plateforme. */
  forProduct?: boolean
  currency?: string
}

/** Champs d'un standard ou d'un produit : les communs, puis ceux de la
 *  fiche de sa catégorie (santé, aliment, poussins…), qui changent avec
 *  elle. */
export function SheetFields({ forProduct = false, currency = 'FCFA' }: Props) {
  const { data: meta } = useMeta()
  const species = useSpeciesOptions()
  const categories = useCategories()
  const form = Form.useFormInstance()
  const categoryId = Form.useWatch('category', form) as string | undefined
  const sheet = categoryId ? categories.byId.get(categoryId)?.sheet : undefined
  const { data: standards = [] } = useList<Standard[]>('standards')
  const ownStandards = standards
    .filter((s) => !s.deleted_at && s.category === categoryId)
    .map((s) => ({ value: s.id, label: s.name }))

  return (
    <>
      <Form.Item name="category" label="Catégorie" rules={[{ required: true }]}>
        <Select options={categories.options} />
      </Form.Item>
      <Form.Item name="name" label="Nom" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      {forProduct && (
        <>
          <Form.Item name="standard" label="Standard"
            extra="Ce que décrit le standard, confirmé par l'expert : le fermier le trouve dans « Où l'acheter ? ».">
            <Select allowClear showSearch optionFilterProp="label" options={ownStandards} />
          </Form.Item>
          <Space>
            <Form.Item name="price" label={`Prix (${currency})`} extra="Vide : à demander.">
              <InputNumber min={0} style={{ width: 160 }} />
            </Form.Item>
            <Form.Item name="unit" label="Unité">
              <Input placeholder="sac de 50 kg, flacon de 1000 doses…" />
            </Form.Item>
          </Space>
          <Space>
            <Form.Item name="certification" label="Certification"
              extra="Autorisation de mise sur le marché, label…">
              <Input />
            </Form.Item>
            <Form.Item name="certified" label="Contrôlée" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Space>
        </>
      )}
      <Form.Item name="species" label="Espèces" extra="Aucune : toutes les volailles.">
        <Select mode="multiple" allowClear options={species} />
      </Form.Item>

      {sheet === 'medicament' && (
        <>
          <Space>
            <Form.Item name="medicine_kind" label="Type" rules={[{ required: true }]}>
              <Select options={meta?.medicine_kinds} style={{ width: 180 }} />
            </Form.Item>
            <Form.Item name="indication" label="Maladie ou usage">
              <Input />
            </Form.Item>
          </Space>
          <Space>
            <Form.Item name="route" label="Voie">
              <Select allowClear options={meta?.routes} style={{ width: 180 }} />
            </Form.Item>
            <Form.Item name="dose" label="Dose">
              <Input placeholder="1 g par litre…" />
            </Form.Item>
          </Space>
          <Space>
            <Form.Item name="dose_quantity" label="Posologie : unités">
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item name="dose_water_liters" label="pour … litres d'eau">
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item name="packaging" label="Conditionnement">
              <Select allowClear options={meta?.packagings} style={{ width: 160 }} />
            </Form.Item>
          </Space>
          <Form.Item name="withdrawal_days" label="Délai d'attente avant vente (jours)"
            rules={forProduct ? [] : [{ required: true }]}
            extra={forProduct ? 'Celui annoncé ; le standard fait foi.' : 'Il fait foi pour les fermes.'}>
            <InputNumber min={0} style={{ width: 120 }} />
          </Form.Item>
        </>
      )}

      {sheet === 'aliment' && (
        <>
          <Space>
            {forProduct && (
              <Form.Item name="brand" label="Marque">
                <Input />
              </Form.Item>
            )}
            <Form.Item name="phase" label="Phase" rules={[{ required: true }]}>
              <Select options={meta?.feed_phases} style={{ width: 180 }} />
            </Form.Item>
          </Space>
          <Space>
            <Form.Item name="age_from_days" label="Âge de (jours)">
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item name="age_to_days" label="à (jours)">
              <InputNumber min={0} />
            </Form.Item>
            {forProduct && (
              <Form.Item name="bag_kg" label="Sac (kg)">
                <InputNumber min={1} />
              </Form.Item>
            )}
          </Space>
          <Space>
            <Form.Item name="protein_percent" label="Protéines (%)">
              <InputNumber min={0} max={100} step={0.5} />
            </Form.Item>
            <Form.Item name="energy_kcal" label="Énergie (kcal/kg)">
              <InputNumber min={0} />
            </Form.Item>
          </Space>
          {forProduct && (
            <Form.Item name="composition" label="Composition">
              <Input.TextArea rows={2} />
            </Form.Item>
          )}
        </>
      )}

      {sheet === 'sujet' && (
        <>
          <Space>
            <Form.Item name="strain" label="Souche">
              <Input placeholder="Cobb 500, Sasso…" />
            </Form.Item>
            <Form.Item name="purpose" label="Destination">
              <Select allowClear options={meta?.purposes} style={{ width: 180 }} />
            </Form.Item>
            <Form.Item name="age_days" label="Âge (jours)">
              <InputNumber min={0} />
            </Form.Item>
          </Space>
          <Form.Item name="vaccines" label="Vaccins faits au couvoir">
            <Input placeholder="Marek, Gumboro in ovo…" />
          </Form.Item>
          {forProduct && (
            <Space>
              <Form.Item name="min_quantity" label="Quantité minimum">
                <InputNumber min={0} />
              </Form.Item>
              <Form.Item name="lead_days" label="Réserver … jours avant">
                <InputNumber min={0} />
              </Form.Item>
            </Space>
          )}
        </>
      )}

      {!forProduct && (
        <Form.Item name="unit" label="Unité">
          <Input />
        </Form.Item>
      )}
      <Form.Item name="description" label="Description">
        <Input.TextArea rows={2} />
      </Form.Item>
    </>
  )
}
