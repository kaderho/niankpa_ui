import { Alert, Form, Input, Modal, Select, Switch } from 'antd'
import { useEffect } from 'react'

import type { TeamGroup, TeamMember } from '../../api/types'
import { useAuth } from '../../auth/context'
import { showFormErrors } from '../../shared/forms'
import { useList, useSave } from '../../shared/queries'

interface Props {
  /** Membre à modifier, `{}` pour en créer un, `null` : fermé. */
  member: Partial<TeamMember> | null
  onClose: () => void
}

type Values = Pick<TeamMember, 'phone' | 'name' | 'groups' | 'is_superuser'> & { password?: string }

export function MemberModal({ member, onClose }: Props) {
  const { user } = useAuth()
  const [form] = Form.useForm<Values>()
  const { data: groups = [] } = useList<TeamGroup[]>('groups')
  const save = useSave<TeamMember>('team', { success: 'Membre enregistré.', invalidate: ['groups', 'accounts'] })
  const creating = member != null && member.id == null
  const superuser = Form.useWatch('is_superuser', form)

  useEffect(() => {
    if (member) {
      form.resetFields()
      form.setFieldsValue({ groups: [], is_superuser: false, ...member, password: undefined })
    }
  }, [member, form])

  const submit = ({ password, ...values }: Values) =>
    save.mutate(
      { ...values, ...(password ? { password } : {}), id: member?.id },
      {
        onSuccess: onClose,
        onError: (error) => {
          const rest = showFormErrors(form, error)
          if (rest) form.setFields([{ name: 'phone', errors: [rest] }])
        },
      },
    )

  return (
    <Modal
      open={member != null}
      title={creating ? 'Nouveau membre de l\'équipe' : `Modifier ${member?.name || member?.phone || ''}`}
      okText="Enregistrer"
      confirmLoading={save.isPending}
      onOk={() => form.submit()}
      onCancel={onClose}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={submit}>
        <Form.Item name="phone" label="Numéro de téléphone" rules={[{ required: true }]} extra="Il sert à se connecter.">
          <Input disabled={!creating} placeholder="07 00 00 00 00" />
        </Form.Item>
        <Form.Item name="name" label="Nom">
          <Input placeholder="Prénom et nom" />
        </Form.Item>
        <Form.Item
          name="password"
          label={creating ? 'Mot de passe' : 'Nouveau mot de passe'}
          rules={creating ? [{ required: true, min: 6 }] : [{ min: 6 }]}
          extra={creating ? 'Au moins 6 caractères. Transmettez-le à la personne.' : 'Laissez vide pour garder l\'actuel.'}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
        <Form.Item name="groups" label="Groupes">
          <Select
            mode="multiple"
            allowClear
            disabled={superuser}
            placeholder="Choisir un ou plusieurs groupes"
            options={groups.map((group) => ({ value: group.id, label: group.name }))}
            notFoundContent="Créez d'abord un groupe dans l'onglet Groupes."
          />
        </Form.Item>
        {user?.is_superuser && (
          <Form.Item
            name="is_superuser"
            label="Super-administrateur"
            valuePropName="checked"
            extra="Voit toutes les rubriques, quels que soient ses groupes."
          >
            <Switch disabled={member?.id === user.id} />
          </Form.Item>
        )}
        {superuser && <Alert type="warning" showIcon title="Ce compte a accès à tout le back-office." />}
      </Form>
    </Modal>
  )
}
