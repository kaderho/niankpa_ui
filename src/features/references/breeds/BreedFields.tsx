import { Col, Divider, Form, Input, InputNumber, Row, Select } from 'antd'

import type { Program } from '../../../api/types'
import { useSpeciesOptions } from '../../directory/labels'
import { useCurrency, useList, useMeta } from '../../../shared/queries'
import { useStandardOptions } from './standardOptions'

const number = { style: { width: '100%' } }

/** Champs d'une fiche de souche : identité, cycle, mortalité, bâtiment,
 *  vente. */
export function BreedFields() {
  const { data: meta } = useMeta()
  const currency = useCurrency()
  const species = useSpeciesOptions()
  const chicks = useStandardOptions('sujet')
  const { data: programs = [] } = useList<Program[]>('programs')
  const speciesId = Form.useWatch('species')
  const programOptions = programs
    .filter((p) => !p.deleted_at && (!speciesId || p.species === speciesId))
    .map((p) => ({ value: p.id, label: p.name }))

  return (
    <>
      <Form.Item name="name" label="Nom" rules={[{ required: true }]}>
        <Input placeholder="Cobb 500, Sasso…" />
      </Form.Item>
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item name="species" label="Espèce" rules={[{ required: true }]}>
            <Select options={species} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="breed_type" label="Type" rules={[{ required: true }]}>
            <Select options={meta?.breed_types} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="purpose" label="Destination" rules={[{ required: true }]}>
            <Select options={meta?.purposes} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="reliability" label="Fiabilité des chiffres" rules={[{ required: true }]}
            extra="Le fermier la voit sur la fiche.">
            <Select options={meta?.breed_reliabilities} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="description" label="Description">
        <Input.TextArea rows={2} maxLength={500} />
      </Form.Item>
      <Form.Item name="standard" label="Standard des poussins" extra="Mène aux fournisseurs qui la vendent.">
        <Select allowClear showSearch optionFilterProp="label" options={chicks} />
      </Form.Item>
      <Form.Item name="program" label="Programme de prophylaxie">
        <Select allowClear options={programOptions} />
      </Form.Item>

      <Divider titlePlacement="start">Cycle</Divider>
      <Row gutter={12}>
        <Col span={8}>
          <Form.Item name="sale_age_min_days" label="Vente min. (j)"><InputNumber min={1} {...number} /></Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="sale_age_days" label="Conseillée (j)"><InputNumber min={1} {...number} /></Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="sale_age_max_days" label="Vente max. (j)"><InputNumber min={1} {...number} /></Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="lay_start_week" label="Début ponte (sem.)"><InputNumber min={1} {...number} /></Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="lay_peak_week" label="Pic (sem.)"><InputNumber min={1} {...number} /></Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="lay_end_week" label="Réforme (sem.)"><InputNumber min={1} {...number} /></Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="mortality_low_percent" label="Mortalité basse (%)">
            <InputNumber min={0} max={100} step={0.5} {...number} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="mortality_high_percent" label="Mortalité haute (%)">
            <InputNumber min={0} max={100} step={0.5} {...number} />
          </Form.Item>
        </Col>
      </Row>

      <Divider titlePlacement="start">Bâtiment</Divider>
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item name="density_start" label="Densité au démarrage (sujets/m²)"><InputNumber min={0} {...number} /></Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="density_end" label="Densité en fin de cycle (sujets/m²)"><InputNumber min={0} {...number} /></Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="feeders_per_100" label="Mangeoires / 100 sujets"><InputNumber min={0} {...number} /></Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="drinkers_per_100" label="Abreuvoirs / 100 sujets"><InputNumber min={0} {...number} /></Form.Item>
        </Col>
      </Row>

      <Divider titlePlacement="start">Vente</Divider>
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item name="sale_unit" label="Unité de vente" rules={[{ required: true }]}>
            <Select options={meta?.sale_units} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="sale_price" label={`Prix indicatif (${currency})`}
            extra="Un repère, signalé au fermier comme pouvant différer du marché.">
            <InputNumber min={0} step={100} {...number} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="position" label="Ordre d'affichage">
        <InputNumber style={{ width: 120 }} />
      </Form.Item>
    </>
  )
}
