import { Checkbox, Flex, Form, Input, Modal, Typography } from 'antd'
import { useEffect } from 'react'

import { fieldErrors } from '../../api/client'
import type { TeamGroup } from '../../api/types'
import { useMeta, useSave } from '../../shared/queries'
import { byMenu } from './sections'

interface Props {
  /** Groupe à modifier, `{}` pour en créer un, `null` : fermé. */
  group: Partial<TeamGroup> | null
  onClose: () => void
}

export function GroupModal({ group, onClose }: Props) {
  const [form] = Form.useForm<TeamGroup>()
  const { data: meta } = useMeta()
  const save = useSave<TeamGroup>('groups', { success: 'Groupe enregistré.', invalidate: ['team'] })
  useEffect(() => {
    if (group) {
      form.resetFields()
      form.setFieldsValue({ sections: [], ...group })
    }
  }, [group, form])

  const submit = (values: TeamGroup) =>
    save.mutate(
      { name: values.name, sections: values.sections, id: group?.id },
      {
        onSuccess: onClose,
        onError: (error) =>
          form.setFields(
            Object.entries(fieldErrors(error)).map(([name, errors]) => ({ name: name as keyof TeamGroup, errors })),
          ),
      },
    )

  return (
    <Modal
      open={group != null}
      title={group?.id ? 'Modifier le groupe' : 'Nouveau groupe'}
      okText="Enregistrer"
      confirmLoading={save.isPending}
      onOk={() => form.submit()}
      onCancel={onClose}
      destroyOnHidden
      width={560}
    >
      <Form form={form} layout="vertical" onFinish={submit}>
        <Form.Item name="name" label="Nom" rules={[{ required: true, whitespace: true }]}>
          <Input placeholder="Commercial, Support, Comptabilité…" />
        </Form.Item>
        <Form.Item name="sections" label="Rubriques ouvertes">
          <Checkbox.Group style={{ width: '100%' }}>
            <Flex vertical gap={12} style={{ width: '100%' }}>
              {byMenu(meta?.sections ?? []).map(([menu, sections]) => (
                <div key={menu}>
                  <Typography.Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase' }}>
                    {menu}
                  </Typography.Text>
                  <Flex wrap gap={8} style={{ marginTop: 4 }}>
                    {sections.map((section) => (
                      <Checkbox key={section.key} value={section.key} style={{ minWidth: 220 }}>
                        {section.label}
                      </Checkbox>
                    ))}
                  </Flex>
                </div>
              ))}
            </Flex>
          </Checkbox.Group>
        </Form.Item>
        <Typography.Text type="secondary">
          « Équipe et groupes » permet de créer des comptes et de distribuer les groupes : réservez-la aux administrateurs.
        </Typography.Text>
      </Form>
    </Modal>
  )
}
