import { Col, Divider, Form, Input, InputNumber, Row, Switch, Typography } from 'antd'

import type { Meta } from '../../../api/types'

export function GeneralSection({ meta }: { meta: Meta }) {
  return (
    <>
      <Form.Item name="currency" label="Devise" extra="Affichée après les montants ; vide pour ne rien afficher.">
        <Input style={{ maxWidth: 200 }} maxLength={10} />
      </Form.Item>
      <Divider titlePlacement="start">Réglages du métier</Divider>
      <Row gutter={24}>
        {meta.settings.map((setting) => (
          <Col key={setting.name} xs={24} md={12}>
            {setting.type === 'BooleanField' ? (
              <Form.Item name={setting.name} label={capitalize(setting.label)} valuePropName="checked">
                <Switch />
              </Form.Item>
            ) : (
              <Form.Item name={setting.name} label={capitalize(setting.label)} rules={[{ required: true }]}>
                <InputNumber
                  min={0}
                  step={setting.type === 'FloatField' ? 0.5 : 1}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            )}
          </Col>
        ))}
      </Row>
    </>
  )
}

export function FeaturesSection({ meta }: { meta: Meta }) {
  return (
    <>
      <Typography.Paragraph type="secondary">
        Une rubrique coupée ici disparaît de toutes les applications, quel que soit le plan.
      </Typography.Paragraph>
      <Row gutter={[24, 8]}>
        {meta.app_features.map((feature) => (
          <Col key={feature.field} xs={24} md={12}>
            <Form.Item name={feature.field} valuePropName="checked" label={feature.label} layout="horizontal"
              labelCol={{ flex: 'auto' }} wrapperCol={{ flex: 'none' }} colon={false}>
              <Switch />
            </Form.Item>
          </Col>
        ))}
      </Row>
    </>
  )
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)
