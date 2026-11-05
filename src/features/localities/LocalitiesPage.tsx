import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Card, Popconfirm, Select, Space, Table, Typography } from 'antd'
import { useCallback, useState } from 'react'

import { api } from '../../api/client'
import type { Locality, Page } from '../../api/types'
import { PageHeader } from '../../shared/PageHeader'
import { useAction, useList } from '../../shared/queries'
import { SearchBar } from '../../shared/SearchBar'
import { ImportButton } from './ImportButton'
import { LocalityModal } from './LocalityModal'

/** Localités de la Côte d'Ivoire, auxquelles se rattachent fermes,
 *  fournisseurs et vétérinaires. */
export function LocalitiesPage() {
  const [params, setParams] = useState<Record<string, unknown>>({ page: 1, page_size: 20 })
  const { data, isFetching } = useList<Page<Locality>>('localities', params)
  const { data: districts = [] } = useList<string[]>('localities/districts')
  const [editing, setEditing] = useState<Partial<Locality> | null>(null)
  const remove = useAction('localities', (id) => api('delete', `/bo/localities/${id}/`), {
    success: 'Localité supprimée.',
  })
  const onSearch = useCallback((search: string) => setParams((p) => ({ ...p, search, page: 1 })), [])

  return (
    <>
      <PageHeader
        title="Localités"
        subtitle="Villes, villages et quartiers de Côte d'Ivoire. Fermes, fournisseurs et vétérinaires sont rattachés à la plus proche de leur position."
        extra={
          <>
            <ImportButton />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing({})}>
              Ajouter
            </Button>
          </>
        }
      />
      <Card>
        <SearchBar placeholder="Nom, district, région, département" onSearch={onSearch}>
          <Select
            allowClear
            showSearch
            placeholder="District"
            style={{ width: 220 }}
            options={districts.map((d) => ({ value: d, label: d }))}
            onChange={(district) => setParams((p) => ({ ...p, district, page: 1 }))}
          />
        </SearchBar>
        <Table<Locality>
          rowKey="id"
          loading={isFetching}
          dataSource={data?.results}
          scroll={{ x: 900 }}
          pagination={{
            current: params.page as number,
            pageSize: params.page_size as number,
            total: data?.count,
            showSizeChanger: true,
            showTotal: (total) => `${total.toLocaleString('fr-FR')} localités`,
            onChange: (page, page_size) => setParams((p) => ({ ...p, page, page_size })),
          }}
          columns={[
            { title: 'Nom', dataIndex: 'name', render: (v: string) => <Typography.Text strong>{v}</Typography.Text> },
            { title: 'District', dataIndex: 'district' },
            { title: 'Région', dataIndex: 'region' },
            { title: 'Département', dataIndex: 'department' },
            {
              title: 'Position',
              render: (_, l) =>
                l.latitude == null ? '—' : `${l.latitude.toFixed(4)}, ${l.longitude?.toFixed(4)}`,
            },
            {
              title: 'Habitants',
              dataIndex: 'population',
              align: 'right',
              render: (v: number) => (v ? v.toLocaleString('fr-FR') : '—'),
            },
            {
              key: 'actions',
              align: 'right',
              render: (_, l) => (
                <Space>
                  <Button type="text" icon={<EditOutlined />} onClick={() => setEditing(l)} />
                  <Popconfirm
                    title="Supprimer cette localité ?"
                    description="Les fiches qui y sont rattachées en seront détachées."
                    okText="Supprimer"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => remove.mutate(l.id)}
                  >
                    <Button type="text" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
        <Typography.Text type="secondary">
          Import : un export GeoNames de la Côte d'Ivoire (CI.zip) ou un CSV avec les colonnes name, district, region,
          department, latitude, longitude, population.
        </Typography.Text>
      </Card>
      <LocalityModal locality={editing} onClose={() => setEditing(null)} />
    </>
  )
}
