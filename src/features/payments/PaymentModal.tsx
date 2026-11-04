import { App, DatePicker, Form, Input, InputNumber, Modal, Select } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'

import type { Organization, Page, Payment, Plan } from '../../api/types'
import { showFormErrors } from '../../shared/forms'
import { useCurrency, useList, useMeta, useSave } from '../../shared/queries'

interface Values extends Omit<Payment, 'paid_at' | 'id'> {
  paid_at: Dayjs
}

interface Props {
  open: boolean
  onClose: () => void
  /** Organisation déjà choisie (depuis sa fiche). */
  organization?: Organization
}

/** Enregistrer un paiement reçu : il prolonge l'abonnement aussitôt. */
export function PaymentModal({ open, onClose, organization }: Props) {
  const [form] = Form.useForm<Values>()
  const { message } = App.useApp()
  const currency = useCurrency()
  const { data: meta } = useMeta()
  const { data: plans = [] } = useList<Plan[]>('plans')
  const [search, setSearch] = useState('')
  const { data: found } = useList<Page<Organization>>('organizations', { search, page_size: 20 })
  const save = useSave<Payment>('payments', {
    invalidate: ['organizations', 'stats'],
    success: 'Paiement enregistré : abonnement prolongé.',
  })

  useEffect(() => {
    if (!open) return
    form.resetFields()
    form.setFieldsValue({
      organization: organization?.id,
      plan: organization?.plan ?? undefined,
      months: 1,
      method: 'wave',
      paid_at: dayjs(),
    })
  }, [open, organization, form])

  // Montant proposé : prix du plan × mois, modifiable.
  const fillAmount = () => {
    const plan = plans.find((p) => p.id === form.getFieldValue('plan'))
    const months = form.getFieldValue('months') ?? 1
    if (plan?.price) form.setFieldValue('amount', plan.price * months)
  }

  const submit = async (values: Values) => {
    try {
      await save.mutateAsync({ ...values, paid_at: values.paid_at.toISOString() })
      onClose()
    } catch (error) {
      const general = showFormErrors(form, error)
      if (general) message.error(general)
    }
  }

  const organizations = organization ? [organization] : (found?.results ?? [])

  return (
    <Modal
      title="Enregistrer un paiement"
      open={open}
      onCancel={onClose}
      onOk={form.submit}
      okText="Enregistrer"
      confirmLoading={save.isPending}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={submit} onValuesChange={(changed) => {
        if ('plan' in changed || 'months' in changed) fillAmount()
      }}>
        <Form.Item name="organization" label="Organisation" rules={[{ required: true }]}>
          <Select
            showSearch={{ filterOption: false, onSearch: setSearch }}
            disabled={Boolean(organization)}
            placeholder="Nom, code ou numéro"
            options={organizations.map((o) => ({ value: o.id, label: `${o.name || o.code} (${o.code})` }))}
          />
        </Form.Item>
        <Form.Item name="plan" label="Plan" rules={[{ required: true }]}>
          <Select options={plans.map((p) => ({ value: p.id, label: p.name }))} />
        </Form.Item>
        <Form.Item name="months" label="Mois payés" rules={[{ required: true }]}>
          <InputNumber min={1} max={36} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="amount" label={`Montant (${currency})`} rules={[{ required: true }]}>
          <InputNumber min={0} step={500} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="method" label="Moyen de paiement" rules={[{ required: true }]}>
          <Select options={meta?.payment_methods} />
        </Form.Item>
        <Form.Item name="reference" label="Référence de la transaction">
          <Input />
        </Form.Item>
        <Form.Item name="paid_at" label="Payé le" rules={[{ required: true }]}>
          <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="note" label="Note">
          <Input.TextArea rows={2} maxLength={300} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
