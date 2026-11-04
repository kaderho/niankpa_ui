import { CheckOutlined } from '@ant-design/icons'
import { Button, Flex, Form, Input, Modal, Switch, Table, Tag, Typography } from 'antd'
import { useMemo, useState } from 'react'

import { api } from '../../api/client'
import type { Report } from '../../api/types'
import { formatDateTime } from '../../shared/format'
import { useAction, useList, useMeta } from '../../shared/queries'
import { labelOf } from './labels'

/** Signalements des fermiers : l'équipe les lit, décide, et suspend le
 *  fournisseur depuis l'onglet des vérifiés s'il le faut. */
export function ReportsTab() {
  const { data: meta } = useMeta()
  const [showHandled, setShowHandled] = useState(false)
  const params = useMemo(() => (showHandled ? undefined : { handled: 'false' }), [showHandled])
  const { data = [], isFetching } = useList<Report[]>('reports', params)
  const [handling, setHandling] = useState<Report | null>(null)
  const [form] = Form.useForm<{ decision: string }>()
  const handle = useAction(
    'reports',
    (id) => api('post', `/bo/reports/${id}/handle/`, { decision: form.getFieldValue('decision') }),
    { success: 'Signalement traité.' },
  )

  return (
    <>
      <Flex align="center" gap={8} style={{ marginBottom: 16 }}>
        <Switch size="small" checked={showHandled} onChange={setShowHandled} />
        <Typography.Text type="secondary">Afficher les signalements traités</Typography.Text>
      </Flex>
      <Table<Report>
        rowKey="id"
        size="middle"
        loading={isFetching}
        dataSource={data}
        pagination={false}
        scroll={{ x: 640 }}
        columns={[
          { title: 'Reçu', dataIndex: 'created_at', render: formatDateTime, width: 150 },
          {
            title: 'Fournisseur',
            render: (_, row) => (
              <>
                {row.partner_name} {row.partner_status === 'suspendu' && <Tag color="volcano">Suspendu</Tag>}
              </>
            ),
          },
          { title: 'Produit', dataIndex: 'product_name', render: (v: string | null) => v ?? '—' },
          { title: 'Motif', dataIndex: 'reason', render: (v: string) => labelOf(meta?.report_reasons, v) },
          { title: 'Note', dataIndex: 'note' },
          { title: 'Ferme', dataIndex: 'farm_name', render: (v: string | null) => v ?? '—' },
          {
            key: 'state',
            align: 'right',
            render: (_, row) =>
              row.handled_at ? (
                <Tag color="green" title={row.decision}>Traité</Tag>
              ) : (
                <Button icon={<CheckOutlined />} onClick={() => setHandling(row)}>
                  Traiter
                </Button>
              ),
          },
        ]}
      />
      <Modal
        title="Traiter le signalement"
        open={handling !== null}
        onCancel={() => setHandling(null)}
        okText="Enregistrer"
        onOk={() => handle.mutateAsync(handling!.id).then(() => setHandling(null))}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="decision" label="Décision" extra="Ce qui a été fait : appel, correction, suspension…">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
