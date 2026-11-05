import { Form, Input, InputNumber, Modal, Space } from 'antd'
import { useEffect } from 'react'

import { fieldErrors } from '../../api/client'
import type { Locality } from '../../api/types'
import { useSave } from '../../shared/queries'

interface Props {
  /** Localité à modifier, `{}` pour en ajouter une, `null` : fermé. */
  locality: Partial<Locality> | null
  onClose: () => void
}

export function LocalityModal({ locality, onClose }: Props) {
  const [form] = Form.useForm<Locality>()
  const save = useSave<Locality>('localities', { success: 'Localité enregistrée.' })
  useEffect(() => {
    if (locality) {
      form.resetFields()
      form.setFieldsValue(locality)
    }
  }, [locality, form])

  const submit = (values: Locality) =>
    save.mutate(
      { ...values, id: locality?.id },
      {
        onSuccess: onClose,
        onError: (error) =>
          form.setFields(Object.entries(fieldErrors(error)).map(([name, errors]) => ({ name: name as keyof Locality, errors }))),
      },
    )

  return (
    <Modal
      open={locality != null}
      title={locality?.id ? 'Modifier la localité' : 'Nouvelle localité'}
      okText="Enregistrer"
      confirmLoading={save.isPending}
      onOk={() => form.submit()}
      onCancel={onClose}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={submit}>
        <Form.Item name="name" label="Nom" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Space wrap>
          <Form.Item name="district" label="District">
            <Input />
          </Form.Item>
          <Form.Item name="region" label="Région">
            <Input />
          </Form.Item>
          <Form.Item name="department" label="Département">
            <Input />
          </Form.Item>
          <Form.Item name="sub_prefecture" label="Sous-préfecture">
            <Input />
          </Form.Item>
        </Space>
        <Space wrap>
          <Form.Item name="latitude" label="Latitude">
            <InputNumber min={-90} max={90} step={0.0001} style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="longitude" label="Longitude">
            <InputNumber min={-180} max={180} step={0.0001} style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="population" label="Habitants" extra="0 : inconnu.">
            <InputNumber min={0} style={{ width: 150 }} />
          </Form.Item>
        </Space>
      </Form>
    </Modal>
  )
}
