import { CheckCircleOutlined, PauseCircleOutlined, StopOutlined } from '@ant-design/icons'
import { Button, Form, Input, Modal, Popconfirm, Tag, Tooltip } from 'antd'
import { useState } from 'react'

import { api } from '../../../api/client'
import type { ReviewStatus, Reviewed } from '../../../api/types'
import { formatDate } from '../../../shared/format'
import { useAction } from '../../../shared/queries'

const LOOK: Record<ReviewStatus, { color: string; label: string }> = {
  attente: { color: 'orange', label: 'En attente' },
  verifie: { color: 'green', label: 'Vérifié' },
  refuse: { color: 'red', label: 'Refusé' },
  suspendu: { color: 'volcano', label: 'Suspendu' },
}

/** État de la vérification, avec l'expert, la date et le motif au survol. */
export function ReviewTag({ row }: { row: Reviewed }) {
  const look = LOOK[row.status]
  const detail = [
    row.reviewed_by_phone && `par ${row.reviewed_by_phone}`,
    row.reviewed_at && `le ${formatDate(row.reviewed_at)}`,
    row.status_note,
  ]
    .filter(Boolean)
    .join(' · ')
  return (
    <Tooltip title={detail || undefined}>
      <Tag color={look.color}>{look.label}</Tag>
    </Tooltip>
  )
}

interface Props {
  /** Ressource de /api/bo/ : partners ou products. */
  resource: 'partners' | 'products'
  row: Reviewed & { id: string; deleted_at: string | null }
  /** Un fournisseur se suspend ; un produit se refuse. */
  canSuspend?: boolean
}

/** Le verdict de l'expert : vérifier, refuser, suspendre, avec un motif
 *  pour ce qui retire une fiche. */
export function ReviewActions({ resource, row, canSuspend = false }: Props) {
  const [asking, setAsking] = useState<'refuse' | 'suspend' | null>(null)
  const [form] = Form.useForm<{ note: string }>()
  const review = useAction(
    resource,
    (id) => api('post', `/bo/${resource}/${id}/${asking ?? 'verify'}/`, { note: form.getFieldValue('note') }),
    { success: 'Décision enregistrée.', invalidate: ['partners', 'products'] },
  )
  if (row.deleted_at) return null

  return (
    <>
      {row.status !== 'verifie' && (
        <Popconfirm
          title="Vérifier et publier ?"
          description="La fiche part vers les téléphones de toutes les fermes."
          okText="Vérifier"
          onConfirm={() => {
            setAsking(null)
            form.setFieldValue('note', '')
            review.mutate(row.id)
          }}
        >
          <Tooltip title="Vérifier">
            <Button type="text" icon={<CheckCircleOutlined />} aria-label="Vérifier" />
          </Tooltip>
        </Popconfirm>
      )}
      {row.status !== 'refuse' && row.status !== 'suspendu' && (
        <Tooltip title={canSuspend && row.status === 'verifie' ? 'Suspendre' : 'Refuser'}>
          <Button
            type="text"
            danger
            icon={canSuspend && row.status === 'verifie' ? <PauseCircleOutlined /> : <StopOutlined />}
            onClick={() => setAsking(canSuspend && row.status === 'verifie' ? 'suspend' : 'refuse')}
          />
        </Tooltip>
      )}
      <Modal
        title={asking === 'suspend' ? 'Suspendre le fournisseur' : 'Refuser la fiche'}
        open={asking !== null}
        onCancel={() => setAsking(null)}
        okText={asking === 'suspend' ? 'Suspendre' : 'Refuser'}
        okButtonProps={{ danger: true }}
        onOk={() => form.validateFields().then(() => review.mutateAsync(row.id)).then(() => setAsking(null))}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="note"
            label="Motif"
            rules={[{ required: true, message: 'Donnez le motif.' }]}
            extra={asking === 'suspend' ? 'Tous ses produits quittent les téléphones.' : undefined}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
