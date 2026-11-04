import { CheckCircleFilled } from '@ant-design/icons'
import { Form, Input, Typography } from 'antd'

interface Props {
  name: string
  label: string
  isSet: boolean
  multiline?: boolean
}

export function SecretInput({ name, label, isSet, multiline }: Props) {
  const placeholder = isSet ? 'Enregistré — laisser vide pour garder' : 'Non renseigné'
  return (
    <Form.Item
      name={name}
      label={label}
      extra={
        isSet && (
          <Typography.Text type="success">
            <CheckCircleFilled /> Valeur enregistrée
          </Typography.Text>
        )
      }
    >
      {multiline ? (
        <Input.TextArea rows={6} placeholder={placeholder} style={{ fontFamily: 'monospace' }} />
      ) : (
        <Input.Password placeholder={placeholder} autoComplete="new-password" />
      )}
    </Form.Item>
  )
}
