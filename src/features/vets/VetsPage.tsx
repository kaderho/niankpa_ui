import { WalletOutlined } from '@ant-design/icons'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Card, Table, Tag, Typography } from 'antd'
import { useCallback, useState } from 'react'

import { api } from '../../api/client'
import type { GlobalConfig, Page, VetPayment, VetSubscription } from '../../api/types'
import { formatDate, formatDateTime, formatMoney } from '../../shared/format'
import { PageHeader } from '../../shared/PageHeader'
import { useCurrency, useList } from '../../shared/queries'
import { SearchBar } from '../../shared/SearchBar'
import { StatusTag } from '../../shared/StatusTag'
import { VetPayModal } from './VetPayModal'

/** Paiements d'un vétérinaire, sous sa ligne. */
function Payments({ vet, currency }: { vet: VetSubscription; currency: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['vets', vet.id, 'payments'],
    queryFn: () => api<VetPayment[]>('get', `/bo/vets/${vet.id}/payments/`),
  })
  return (
    <Table<VetPayment>
      rowKey="id"
      size="small"
      loading={isLoading}
      pagination={false}
      dataSource={data}
      locale={{ emptyText: 'Aucun paiement' }}
      columns={[
        { title: 'Le', dataIndex: 'paid_at', render: formatDateTime },
        { title: 'Places', dataIndex: 'seats' },
        { title: 'Mois', dataIndex: 'months' },
        { title: 'Montant', dataIndex: 'amount', render: (v: number) => formatMoney(v, currency) },
        { title: 'Moyen', dataIndex: 'method' },
        { title: 'Référence', dataIndex: 'reference' },
      ]}
    />
  )
}

/** Forfaits des vétérinaires : essai, places payées, échéance. */
export function VetsPage() {
  const client = useQueryClient()
  const currency = useCurrency()
  const { data: config } = useQuery({
    queryKey: ['config'],
    queryFn: () => api<GlobalConfig>('get', '/bo/config/'),
  })
  const price = Number(config?.vet_farm_price ?? 0)
  const [params, setParams] = useState<Record<string, unknown>>({ page: 1, page_size: 20 })
  const { data, isFetching } = useList<Page<VetSubscription>>('vets', params)
  const [paying, setPaying] = useState<VetSubscription | null>(null)
  const onSearch = useCallback((search: string) => setParams((p) => ({ ...p, search, page: 1 })), [])

  return (
    <>
      <PageHeader
        title="Vétérinaires"
        subtitle={`Une place par ferme suivie, ${formatMoney(price, currency)} par mois. L'essai commence à la première ferme rejointe.`}
      />
      <Card>
        <SearchBar placeholder="Numéro ou note" onSearch={onSearch} />
        <Table<VetSubscription>
          rowKey="id"
          loading={isFetching}
          dataSource={data?.results}
          scroll={{ x: 900 }}
          expandable={{ expandedRowRender: (vet) => <Payments vet={vet} currency={currency} /> }}
          pagination={{
            current: params.page as number,
            total: data?.count,
            onChange: (page) => setParams((p) => ({ ...p, page })),
          }}
          columns={[
            { title: 'Numéro', dataIndex: 'phone' },
            { title: 'État', dataIndex: 'status', render: (status) => <StatusTag status={status} /> },
            {
              title: 'Fermes suivies',
              key: 'farms',
              render: (_, vet) => (
                <Tag color={vet.farms > vet.allowed ? 'error' : undefined}>
                  {vet.farms} / {vet.allowed}
                </Tag>
              ),
            },
            { title: 'Places payées', dataIndex: 'seats' },
            { title: "Fin de l'essai", dataIndex: 'trial_ends_at', render: formatDate },
            { title: "Payé jusqu'au", dataIndex: 'paid_until', render: formatDate },
            {
              key: 'pay',
              align: 'right',
              render: (_, vet) => (
                <Button icon={<WalletOutlined />} onClick={() => setPaying(vet)}>
                  Paiement
                </Button>
              ),
            },
          ]}
        />
        <Typography.Text type="secondary">
          Le vétérinaire ne rejoint pas plus de fermes que de places ; son forfait échu, sa synchro s'arrête.
        </Typography.Text>
      </Card>
      <VetPayModal
        vet={paying}
        price={price}
        currency={currency}
        onClose={() => setPaying(null)}
        onPaid={() => {
          setPaying(null)
          client.invalidateQueries({ queryKey: ['vets'] })
        }}
      />
    </>
  )
}
