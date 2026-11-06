import { LockOutlined, SaveOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { App, Button, Card, Col, Descriptions, Form, Input, Row, Tag } from 'antd'

import { api } from '../../api/client'
import type { StaffUser } from '../../api/types'
import { useAuth } from '../../auth/context'
import { showFormErrors } from '../../shared/forms'
import { PageHeader } from '../../shared/PageHeader'

interface PasswordValues {
  current_password: string
  password: string
  confirm: string
}

/** Mon compte : son nom et son mot de passe, sans passer par un administrateur. */
export function MyAccountPage() {
  const { user, setUser } = useAuth()
  const { message } = App.useApp()
  const [profileForm] = Form.useForm<{ name: string }>()
  const [passwordForm] = Form.useForm<PasswordValues>()

  const rename = useMutation({
    mutationFn: (name: string) => api<StaffUser>('patch', '/bo/me/', { name }),
    onSuccess: (saved) => {
      setUser(saved)
      message.success('Nom enregistré.')
    },
    onError: (error) => {
      const rest = showFormErrors(profileForm, error)
      if (rest) message.error(rest)
    },
  })
  const changePassword = useMutation({
    mutationFn: ({ current_password, password }: PasswordValues) =>
      api('post', '/bo/me/password/', { current_password, password }),
    onSuccess: () => {
      passwordForm.resetFields()
      message.success('Mot de passe changé.')
    },
    onError: (error) => {
      const rest = showFormErrors(passwordForm, error)
      if (rest) message.error(rest)
    },
  })

  return (
    <>
      <PageHeader title="Mon compte" subtitle="Votre nom et votre mot de passe de connexion au back-office." />
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Profil">
            <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Numéro">{user?.phone}</Descriptions.Item>
              <Descriptions.Item label="Accès">
                {user?.is_superuser ? <Tag color="gold">Super-administrateur</Tag> : `${user?.sections.length ?? 0} rubrique(s)`}
              </Descriptions.Item>
            </Descriptions>
            <Form
              form={profileForm}
              layout="vertical"
              initialValues={{ name: user?.name ?? '' }}
              onFinish={({ name }) => rename.mutate(name ?? '')}
            >
              <Form.Item name="name" label="Nom affiché">
                <Input placeholder="Prénom et nom" maxLength={120} />
              </Form.Item>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={rename.isPending}>
                Enregistrer
              </Button>
            </Form>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Mot de passe">
            <Form form={passwordForm} layout="vertical" onFinish={(values) => changePassword.mutate(values)}>
              <Form.Item name="current_password" label="Mot de passe actuel" rules={[{ required: true }]}>
                <Input.Password autoComplete="current-password" />
              </Form.Item>
              <Form.Item
                name="password"
                label="Nouveau mot de passe"
                rules={[{ required: true }, { min: 6, message: 'Au moins 6 caractères.' }]}
              >
                <Input.Password autoComplete="new-password" />
              </Form.Item>
              <Form.Item
                name="confirm"
                label="Confirmer le nouveau mot de passe"
                dependencies={['password']}
                rules={[
                  { required: true },
                  ({ getFieldValue }) => ({
                    validator: (_, value) =>
                      !value || value === getFieldValue('password')
                        ? Promise.resolve()
                        : Promise.reject(new Error('Les deux mots de passe diffèrent.')),
                  }),
                ]}
              >
                <Input.Password autoComplete="new-password" />
              </Form.Item>
              <Button type="primary" htmlType="submit" icon={<LockOutlined />} loading={changePassword.isPending}>
                Changer le mot de passe
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </>
  )
}
