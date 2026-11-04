import { App, Checkbox, Col, Form, Input, InputNumber, Modal, Row, Switch } from 'antd'
import { useEffect } from 'react'

import type { Plan } from '../../api/types'
import { showFormErrors } from '../../shared/forms'
import { useCurrency, useMeta, useSave } from '../../shared/queries'

interface Props {
  /** Plan à modifier ; `null` pour en créer un. Fermé si `undefined`. */
  plan: Plan | null | undefined
  onClose: () => void
}

const EMPTY: Partial<Plan> = {
  price: 0, max_devices: 1, max_birds: 0, max_farms: 1, features: [], rank: 0, is_public: true,
}

export function PlanModal({ plan, onClose }: Props) {
  const [form] = Form.useForm<Plan>()
  const { message } = App.useApp()
  const currency = useCurrency()
  const { data: meta } = useMeta()
  const save = useSave<Plan>('plans')

  useEffect(() => {
    if (plan === undefined) return
    form.resetFields()
    form.setFieldsValue(plan ?? EMPTY)
  }, [plan, form])

  const submit = async (values: Plan) => {
    try {
      await save.mutateAsync({ ...values, id: plan?.id })
      onClose()
    } catch (error) {
      const general = showFormErrors(form, error)
      if (general) message.error(general)
    }
  }

  return (
    <Modal
      title={plan ? `Modifier « ${plan.name} »` : 'Nouveau plan'}
      open={plan !== undefined}
      onCancel={onClose}
      onOk={form.submit}
      okText="Enregistrer"
      confirmLoading={save.isPending}
      width={640}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={submit}>
        <Row gutter={16}>
          <Col span={14}>
            <Form.Item name="name" label="Nom" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item name="code" label="Code" rules={[{ required: true }]} extra="Lettres, chiffres et tirets.">
              <Input disabled={Boolean(plan)} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={2} maxLength={300} />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="price" label={`Prix par mois (${currency})`} extra="0 = sur devis.">
              <InputNumber min={0} step={500} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="rank" label="Ordre d'affichage">
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="max_farms" label="Fermes" extra="0 = illimité">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="max_devices" label="Téléphones" extra="0 = illimité">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="max_birds" label="Sujets" extra="0 = illimité">
              <InputNumber min={0} step={100} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="features" label="Rubriques ouvertes">
          <Checkbox.Group style={{ width: '100%' }}>
            <Row gutter={[8, 8]}>
              {meta?.plan_features.map((feature) => (
                <Col span={8} key={feature.value}>
                  <Checkbox value={feature.value}>{feature.label}</Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </Form.Item>
        <Form.Item name="is_public" label="Proposé dans l'application" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  )
}
