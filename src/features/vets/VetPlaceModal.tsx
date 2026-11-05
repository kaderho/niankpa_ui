import { Form, InputNumber, Modal, Space } from 'antd'
import { useEffect } from 'react'

import type { VetSubscription } from '../../api/types'
import { LocalitySelect } from '../../shared/LocalitySelect'
import { useSave } from '../../shared/queries'

type Where = Pick<VetSubscription, 'place' | 'latitude' | 'longitude'>

/** Où exerce un vétérinaire : sa localité et sa position. */
export function VetPlaceModal({ vet, onClose }: { vet: VetSubscription | null; onClose: () => void }) {
  const [form] = Form.useForm<Where>()
  const save = useSave<VetSubscription>('vets', { success: 'Localité enregistrée.' })
  useEffect(() => {
    if (vet) form.setFieldsValue({ place: vet.place, latitude: vet.latitude, longitude: vet.longitude })
  }, [vet, form])

  return (
    <Modal
      open={vet != null}
      title={`Où exerce ${vet?.phone ?? ''}`}
      okText="Enregistrer"
      confirmLoading={save.isPending}
      onOk={() => form.submit()}
      onCancel={onClose}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={(values) => save.mutate({ ...values, id: vet?.id }, { onSuccess: onClose })}>
        <Form.Item name="place" label="Localité" extra="Vide : la plus proche de la position, à l'enregistrement.">
          <LocalitySelect label={vet?.place_label} />
        </Form.Item>
        <Space>
          <Form.Item name="latitude" label="Latitude">
            <InputNumber min={-90} max={90} step={0.0001} style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="longitude" label="Longitude">
            <InputNumber min={-180} max={180} step={0.0001} style={{ width: 160 }} />
          </Form.Item>
        </Space>
      </Form>
    </Modal>
  )
}
