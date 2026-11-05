import { Button, Popconfirm, Select, Space, Table, Tag, Typography } from 'antd'
import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'

import { api } from '../../api/client'
import type { Departure, Page } from '../../api/types'
import { formatDate } from '../../shared/format'
import { useAction, useList } from '../../shared/queries'
import { SearchBar } from '../../shared/SearchBar'
import { VoiceButton } from './VoiceButton'

/**
 * Motifs de départ : le support écoute le vocal (jamais transmis à une autre
 * organisation) et masque un motif contesté et abusif.
 */
export function DeparturesTab() {
  const [params, setParams] = useState<Record<string, unknown>>({ page: 1, page_size: 20 })
  const { data, isFetching } = useList<Page<Departure>>('departures', params)
  const onSearch = useCallback((search: string) => setParams((p) => ({ ...p, search, page: 1 })), [])
  const hide = useAction('departures', (id) => api('post', `/bo/departures/${id}/hide/`, {}), {
    success: 'Motif masqué : il n’est plus montré.',
  })
  const unhide = useAction('departures', (id) => api('post', `/bo/departures/${id}/unhide/`), {
    success: 'Motif de nouveau montré.',
  })

  return (
    <>
      <SearchBar placeholder="Numéro, nom ou organisation" onSearch={onSearch}>
        <Select
          allowClear
          placeholder="Contestation"
          style={{ width: 170 }}
          options={[
            { value: 'true', label: 'Contestés' },
            { value: 'false', label: 'Non contestés' },
          ]}
          onChange={(contested) => setParams((p) => ({ ...p, contested, page: 1 }))}
        />
        <Select
          allowClear
          placeholder="État"
          style={{ width: 150 }}
          options={[
            { value: 'false', label: 'Montrés' },
            { value: 'true', label: 'Masqués' },
          ]}
          onChange={(hidden) => setParams((p) => ({ ...p, hidden, page: 1 }))}
        />
      </SearchBar>
      <Table<Departure>
        rowKey="id"
        loading={isFetching}
        dataSource={data?.results}
        scroll={{ x: 1100 }}
        pagination={{
          current: params.page as number,
          pageSize: params.page_size as number,
          total: data?.count,
          showSizeChanger: true,
          onChange: (page, page_size) => setParams((p) => ({ ...p, page, page_size })),
        }}
        columns={[
          {
            title: 'Numéro',
            dataIndex: 'phone',
            render: (phone: string, departure) => (
              <>
                <Typography.Text strong>{phone}</Typography.Text>{' '}
                <Typography.Text type="secondary">{departure.name}</Typography.Text>
              </>
            ),
          },
          {
            title: 'Quitte',
            render: (_, departure) => (
              <Link to={`/organizations/${departure.organization}`}>{departure.organization_name}</Link>
            ),
          },
          {
            title: 'Motif',
            render: (_, departure) => (
              <Space direction="vertical" size={2}>
                <Typography.Text strong>{departure.reason_label}</Typography.Text>
                {departure.comment && <Typography.Text>« {departure.comment} »</Typography.Text>}
                {departure.has_voice && (
                  <VoiceButton url={`/bo/departures/${departure.id}/voice/`} label="Vocal" />
                )}
              </Space>
            ),
          },
          {
            title: 'Réponse',
            render: (_, departure) => (
              <Space direction="vertical" size={2}>
                {departure.reply_text || '—'}
                {departure.has_reply_voice && (
                  <VoiceButton url={`/bo/departures/${departure.id}/voice/?of=reply`} label="Vocal" />
                )}
              </Space>
            ),
          },
          {
            title: 'Donné par',
            render: (_, departure) => departure.given_by_name || departure.given_by_phone || '—',
          },
          { title: 'Le', dataIndex: 'created_at', render: formatDate },
          { title: 'Expire', dataIndex: 'expires_at', render: formatDate },
          {
            title: '',
            align: 'right',
            render: (_, departure) => (
              <Space>
                {departure.contested_at && <Tag color="orange">Contesté</Tag>}
                {departure.hidden_at ? (
                  <Button size="small" onClick={() => unhide.mutate(departure.id)}>
                    Montrer
                  </Button>
                ) : (
                  <Popconfirm
                    title="Masquer ce motif ?"
                    description="Il ne sera plus montré aux organisations qui invitent ce numéro."
                    okText="Masquer"
                    cancelText="Annuler"
                    onConfirm={() => hide.mutate(departure.id)}
                  >
                    <Button danger size="small">Masquer</Button>
                  </Popconfirm>
                )}
              </Space>
            ),
          },
        ]}
      />
    </>
  )
}
