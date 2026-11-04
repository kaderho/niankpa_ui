import { App, Button, DatePicker, Form, Input, Select } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'

import type { Organization, Plan } from '../../api/types'
import { showFormErrors } from '../../shared/forms'
import { useList, useSave } from '../../shared/queries'

interface Values {
  name: string
  plan: number | null
  trial_ends_at: Dayjs | null
  paid_until: Dayjs | null
  note: string
}

const day = (value: string | null) => (value ? dayjs(value) : null)
const iso = (value: Dayjs | null) => (value ? value.format('YYYY-MM-DD') : null)

export function OrganizationForm({ organization }: { organization: Organization }) {
  const [form] = Form.useForm<Values>()
  const { message } = App.useApp()
  const { data: plans = [] } = useList<Plan[]>('plans')
  const save = useSave<Organization>('organizations', { invalidate: ['stats'] })

  const submit = async (values: Values) => {
    try {
      await save.mutateAsync({
        id: organization.id,
        ...values,
        trial_ends_at: iso(values.trial_ends_at),
        paid_until: iso(values.paid_until),
      })
    } catch (error) {
      const general = showFormErrors(form, error)
      if (general) message.error(general)
    }
  }

  return (
    <Form<Values>
      form={form}
      layout="vertical"
      onFinish={submit}
      initialValues={{
        name: organization.name,
        plan: organization.plan,
        trial_ends_at: day(organization.trial_ends_at),
        paid_until: day(organization.paid_until),
        note: organization.note,
      }}
    >
      <Form.Item name="name" label="Nom">
        <Input placeholder="Nom du client" />
      </Form.Item>
      <Form.Item name="plan" label="Plan" extra="Un nouveau paiement remplace le plan par celui payé.">
        <Select allowClear options={plans.map((p) => ({ value: p.id, label: p.name }))} />
      </Form.Item>
      <Form.Item name="trial_ends_at" label="Fin de l'essai">
        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item
        name="paid_until"
        label="Payé jusqu'au"
        extra="Se règle tout seul à chaque paiement ; à corriger ici seulement en cas d'erreur."
      >
        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="note" label="Note interne">
        <Input.TextArea rows={3} />
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={save.isPending}>
        Enregistrer
      </Button>
    </Form>
  )
}
