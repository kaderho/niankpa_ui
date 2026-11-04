import { SaveOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App, Button, Card, Form, Skeleton, Tabs, Typography } from 'antd'
import { useEffect } from 'react'

import { api } from '../../api/client'
import type { GlobalConfig } from '../../api/types'
import { showFormErrors } from '../../shared/forms'
import { formatDateTime } from '../../shared/format'
import { PageHeader } from '../../shared/PageHeader'
import { useMeta } from '../../shared/queries'
import { SECRETS } from './secrets'
import { FeaturesSection, GeneralSection } from './sections/AppSections'
import { FirebaseSection, PaydunyaSection, SaasSection } from './sections/ServiceSections'

/** Configuration globale : les téléphones la relisent à chaque synchro. */
export function ConfigPage() {
  const [form] = Form.useForm()
  const { message } = App.useApp()
  const client = useQueryClient()
  const { data: meta } = useMeta()
  const { data: config } = useQuery({
    queryKey: ['config'],
    queryFn: () => api<GlobalConfig>('get', '/bo/config/'),
  })
  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => api<GlobalConfig>('patch', '/bo/config/', body),
    onSuccess: (saved) => {
      client.setQueryData(['config'], saved)
      client.invalidateQueries({ queryKey: ['stats'] })
      message.success('Configuration enregistrée. Les téléphones la recevront à leur prochaine synchro.')
    },
  })

  useEffect(() => {
    if (config) form.setFieldsValue(config)
  }, [config, form])

  if (!config || !meta) return <Skeleton active paragraph={{ rows: 12 }} />

  const submit = async (values: Record<string, unknown>) => {
    // Un champ confidentiel n'est envoyé que si on l'a retouché.
    const body = Object.fromEntries(
      Object.entries(values).filter(([name]) => !SECRETS.includes(name) || form.isFieldTouched(name)),
    )
    try {
      await save.mutateAsync(body)
      form.resetFields(SECRETS)
    } catch (error) {
      const general = showFormErrors(form, error)
      message.error(general ?? 'Certains champs sont à corriger.')
    }
  }

  const secretsSet = config.secrets_set
  return (
    <>
      <PageHeader
        title="Configuration"
        subtitle={`Réglages communs à toutes les applications · modifiés le ${formatDateTime(config.updated_at)}`}
        extra={
          <Button type="primary" icon={<SaveOutlined />} loading={save.isPending} onClick={form.submit}>
            Enregistrer
          </Button>
        }
      />
      <Form form={form} layout="vertical" onFinish={submit} scrollToFirstError>
        <Card>
          <Tabs
            tabPlacement="start"
            items={[
              { key: 'general', label: 'Général', forceRender: true, children: <GeneralSection meta={meta} /> },
              { key: 'features', label: 'Rubriques', forceRender: true, children: <FeaturesSection meta={meta} /> },
              { key: 'saas', label: 'Abonnements', forceRender: true, children: <SaasSection /> },
              { key: 'paydunya', label: 'PayDunya', forceRender: true, children: <PaydunyaSection secrets={secretsSet} /> },
              { key: 'firebase', label: 'Notifications', forceRender: true, children: <FirebaseSection secrets={secretsSet} /> },
            ]}
          />
        </Card>
      </Form>
      <Typography.Paragraph type="secondary" style={{ marginTop: 16 }}>
        Les clés confidentielles ne sont jamais réaffichées. Laissez leur champ vide pour les garder ;
        saisissez une nouvelle valeur pour les remplacer.
      </Typography.Paragraph>
    </>
  )
}
