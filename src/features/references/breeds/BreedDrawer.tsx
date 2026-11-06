import { DownloadOutlined } from '@ant-design/icons'
import { Button, Col, Drawer, Flex, Form, InputNumber, Row, Select, Tabs, Tag } from 'antd'
import { useMemo } from 'react'

import type { Breed, BreedFeedPhase, BreedWeek } from '../../../api/types'
import { formatNumber } from '../../../shared/format'
import { useList, useMeta } from '../../../shared/queries'
import { labelOf } from '../../directory/labels'
import { ReferenceTable } from '../ReferenceTable'
import { useStandardOptions } from './standardOptions'
import { CurveChart } from './CurveChart'
import { downloadWeeks } from './exportWeeks'
import { ImportWeeksButton } from './ImportWeeksButton'

const number = { style: { width: '100%' } }
const grams = (v: number | null) => (v == null ? '—' : `${formatNumber(v)} g`)

/** Courbe hebdomadaire et programme alimentaire d'une souche. */
export function BreedDrawer({ breed, onClose }: { breed: Breed | null; onClose: () => void }) {
  const params = useMemo(() => (breed ? { breed: breed.id } : undefined), [breed])
  return (
    <Drawer open={Boolean(breed)} onClose={onClose} size={900} title={breed?.name} destroyOnHidden>
      {breed && params && (
        <Tabs
          items={[
            { key: 'weeks', label: 'Courbe', children: <WeeksTable breed={breed} params={params} /> },
            { key: 'feed', label: 'Programme alimentaire', children: <PhasesTable params={params} /> },
          ]}
        />
      )}
    </Drawer>
  )
}

function WeeksTable({ breed, params }: { breed: Breed; params: { breed: string } }) {
  const laying = breed.purpose !== 'chair'
  const { data: weeks = [] } = useList<BreedWeek[]>('breed-weeks', params)
  return (
    <>
      <Flex gap={8} wrap>
        <ImportWeeksButton breed={breed} />
        <Button
          icon={<DownloadOutlined />}
          disabled={!weeks.some((w) => !w.deleted_at)}
          onClick={() => downloadWeeks(breed, weeks)}
        >
          Exporter en CSV
        </Button>
      </Flex>
      <CurveChart weeks={weeks} />
      <ReferenceTable<BreedWeek>
        resource="breed-weeks"
        noun="une semaine"
        params={params}
        invalidate={['breeds']}
        titleOf={(row) => `Semaine ${row.week}`}
        columns={[
          { title: 'Semaine', dataIndex: 'week', width: 90, render: (w: number) => <Tag>S{w}</Tag> },
          { title: 'Poids', dataIndex: 'weight_g', render: grams },
          {
            title: 'Fourchette',
            render: (_, row) =>
              row.weight_min_g == null && row.weight_max_g == null
                ? '—'
                : `${grams(row.weight_min_g)} – ${grams(row.weight_max_g)}`,
          },
          { title: 'Aliment / j', dataIndex: 'feed_g_day', render: grams },
          { title: 'Eau / j', dataIndex: 'water_ml_day', render: (v: number | null) => (v == null ? '—' : `${v} ml`) },
          ...(laying
            ? [
                { title: 'Ponte', dataIndex: 'lay_percent', render: (v: number | null) => (v == null ? '—' : `${v} %`) },
                { title: 'Œuf', dataIndex: 'egg_weight_g', render: grams },
              ]
            : []),
        ]}
        fields={
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="week" label="Semaine" rules={[{ required: true }]}>
                <InputNumber min={1} {...number} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="weight_g" label="Poids moyen (g)"><InputNumber min={0} {...number} /></Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="feed_g_day" label="Aliment (g/j)"><InputNumber min={0} {...number} /></Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="weight_min_g" label="Poids min. (g)"><InputNumber min={0} {...number} /></Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="weight_max_g" label="Poids max. (g)"><InputNumber min={0} {...number} /></Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="water_ml_day" label="Eau (ml/j)"><InputNumber min={0} {...number} /></Form.Item>
            </Col>
            {laying && (
              <>
                <Col span={8}>
                  <Form.Item name="lay_percent" label="Ponte (%)"><InputNumber min={0} max={100} {...number} /></Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="egg_weight_g" label="Poids de l'œuf (g)"><InputNumber min={0} {...number} /></Form.Item>
                </Col>
              </>
            )}
          </Row>
        }
      />
    </>
  )
}

function PhasesTable({ params }: { params: { breed: string } }) {
  const { data: meta } = useMeta()
  const feeds = useStandardOptions('aliment')
  return (
    <ReferenceTable<BreedFeedPhase>
      resource="breed-feed-phases"
      noun="une phase"
      params={params}
      titleOf={(row) => labelOf(meta?.feed_phases, row.phase)}
      defaults={{ phase: 'demarrage' }}
      columns={[
        { title: 'Phase', dataIndex: 'phase', render: (v: string) => labelOf(meta?.feed_phases, v) },
        { title: 'Jours', render: (_, row) => `J${row.age_from_days} à J${row.age_to_days}` },
        {
          title: 'Aliment standard',
          dataIndex: 'standard',
          render: (id: string | null) => feeds.find((f) => f.value === id)?.label ?? '—',
        },
      ]}
      fields={
        <>
          <Form.Item name="phase" label="Phase" rules={[{ required: true }]}>
            <Select options={meta?.feed_phases} />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="age_from_days" label="Du jour" rules={[{ required: true }]}>
                <InputNumber min={0} {...number} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="age_to_days" label="Au jour" rules={[{ required: true }]}>
                <InputNumber min={0} {...number} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="standard" label="Aliment standard" extra="Son prix indicatif sert au simulateur.">
            <Select allowClear showSearch optionFilterProp="label" options={feeds} />
          </Form.Item>
        </>
      }
    />
  )
}
