import { LockOutlined, PhoneOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Flex, Form, Input, Typography } from 'antd'
import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import { errorMessage } from '../api/client'
import { Logo } from '../layout/Logo'
import { useAuth } from './context'

interface Credentials {
  phone: string
  password: string
}

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const target = (location.state as { from?: string } | null)?.from ?? '/'

  if (user) return <Navigate to={target} replace />

  const submit = async ({ phone, password }: Credentials) => {
    setLoading(true)
    setError(null)
    try {
      await login(phone, password)
      navigate(target, { replace: true })
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Flex align="center" justify="center" className="login-screen">
      <Card style={{ width: 380, maxWidth: '92vw' }} styles={{ body: { padding: 32 } }}>
        <Flex vertical align="center" gap={4} style={{ marginBottom: 24 }}>
          <Logo size={48} />
          <Typography.Title level={3} style={{ margin: '12px 0 0' }}>
            Nian Kpa
          </Typography.Title>
          <Typography.Text type="secondary">Back-office de l'équipe</Typography.Text>
        </Flex>
        {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
        <Form<Credentials> layout="vertical" requiredMark={false} onFinish={submit} size="large">
          <Form.Item
            name="phone"
            label="Numéro de téléphone"
            rules={[{ required: true, message: 'Saisissez votre numéro.' }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="+225 07 00 00 00 00" autoFocus />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mot de passe"
            rules={[{ required: true, message: 'Saisissez votre mot de passe.' }]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Se connecter
          </Button>
        </Form>
      </Card>
    </Flex>
  )
}
