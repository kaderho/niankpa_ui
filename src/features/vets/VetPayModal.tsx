import { App, Form, Input, InputNumber, Modal, Typography } from 'antd'
import { useEffect } from 'react'

import { api } from '../../api/client'
import type { VetSubscription } from '../../api/types'
import { formatMoney } from '../../shared/format'
import { showFormErrors } from '../../shared/forms'

interface Values {
  seats: number
  months: number
  method: string
  reference: string
}

interface Props {
  vet: VetSubscription | null
  price: number
  currency: string
  onClose: () => void
  onPaid: () => void
}

/** Noter un paiement de places : l'échéance est repoussée d'autant de mois. */
export function VetPayModal({ vet, price, currency, onClose, onPaid }: Props) {
  const [form] = Form.useForm<Values>()
  const { message } = App.useApp()
  const seats = Form.useWatch('seats', form) ?? 0
  const months = Form.useWatch('months', form) ?? 0

  useEffect(() => {
    if (!vet) return
    form.resetFields()
    form.setFieldsValue({ seats: Math.max(vet.seats, vet.farms, 1), months: 1, method: 'wave' })
  }, [vet, form])

  const submit = async (values: Values) => {
    if (!vet) return
    try {
      await api('post', `/bo/vets/${vet.id}/pay/`, values)
      message.success('Paiement noté : forfait prolongé.')
      onPaid()
    } catch (error) {
      const general = showFormErrors(form, error)
      if (general) message.error(general)
    }
  }

  return (
    <Modal
      title={`Paiement de ${vet?.phone ?? ''}`}
      open={vet !== null}
      onCancel={onClose}
      onOk={form.submit}
      okText="Noter le paiement"
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={submit}>
        <Form.Item name="seats" label="Places (une par ferme suivie)" rules={[{ required: true }]}>
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="months" label="Mois" rules={[{ required: true }]}>
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="method" label="Moyen">
          <Input placeholder="Wave, Orange Money, espèces…" />
        </Form.Item>
        <Form.Item name="reference" label="Référence">
          <Input />
        </Form.Item>
        <Typography.Text strong>
          Montant : {formatMoney(seats * months * price, currency)}
        </Typography.Text>
      </Form>
    </Modal>
  )
}
