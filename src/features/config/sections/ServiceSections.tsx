import { Alert, Col, Divider, Form, Input, InputNumber, Row, Switch } from 'antd'

import { SecretInput } from '../SecretInput'

type Secrets = Record<string, boolean>

export function SaasSection() {
  return (
    <>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
        title="Éteint, rien n'est limité : ni plan, ni échéance. Allumé, chaque organisation commence par un essai gratuit."
      />
      <Form.Item name="saas_enabled" label="Abonnements (mode SaaS)" valuePropName="checked">
        <Switch checkedChildren="Allumé" unCheckedChildren="Éteint" />
      </Form.Item>
      <Row gutter={24}>
        <Col xs={24} md={8}>
          <Form.Item name="trial_days" label="Jours d'essai gratuit">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="trial_plan_code" label="Plan pendant l'essai (code)">
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="grace_days" label="Jours de délai après l'échéance">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
      <AdvisorOffer prefix="vet" title="Vétérinaire" />
      <AdvisorOffer prefix="tech" title="Technicien d'élevage" />
      <Form.Item name="payment_instructions" label="Comment payer" extra="Affiché dans l'application.">
        <Input.TextArea rows={4} />
      </Form.Item>
    </>
  )
}

/** Tarif et essai d'un type de conseiller, qui paie une place par ferme suivie. */
function AdvisorOffer({ prefix, title }: { prefix: 'vet' | 'tech'; title: string }) {
  return (
    <>
      <Divider titlePlacement="start">{title}</Divider>
      <Row gutter={24}>
        <Col xs={24} md={8}>
          <Form.Item name={`${prefix}_trial_days`} label="Jours d'essai">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name={`${prefix}_trial_farms`} label="Fermes pendant l'essai">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name={`${prefix}_farm_price`} label="Prix d'une place (ferme / mois)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
    </>
  )
}

export function PaydunyaSection({ secrets }: { secrets: Secrets }) {
  return (
    <>
      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item name="paydunya_enabled" label="Paiement en ligne (PayDunya)" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="paydunya_live" label="Mode réel" valuePropName="checked"
            extra="Éteint : mode test, aucun argent réel.">
            <Switch checkedChildren="Réel" unCheckedChildren="Test" />
          </Form.Item>
        </Col>
      </Row>
      <SecretInput name="paydunya_master_key" label="Clé principale" isSet={secrets.paydunya_master_key} />
      <SecretInput name="paydunya_private_key" label="Clé privée" isSet={secrets.paydunya_private_key} />
      <SecretInput name="paydunya_token" label="Token" isSet={secrets.paydunya_token} />
    </>
  )
}

export function FirebaseSection({ secrets }: { secrets: Secrets }) {
  return (
    <>
      <Form.Item name="push_enabled" label="Notifications poussées" valuePropName="checked"
        extra="Elles ne partent que si les identifiants et le compte de service sont renseignés.">
        <Switch />
      </Form.Item>
      <Row gutter={24}>
        {[
          ['firebase_project_id', 'Identifiant du projet'],
          ['firebase_app_id', "Identifiant de l'application"],
          ['firebase_api_key', 'Clé API'],
          ['firebase_sender_id', "Identifiant d'expéditeur"],
        ].map(([name, label]) => (
          <Col key={name} xs={24} md={12}>
            <Form.Item name={name} label={label}>
              <Input />
            </Form.Item>
          </Col>
        ))}
      </Row>
      <SecretInput
        name="firebase_service_account"
        label="Compte de service Firebase (JSON)"
        isSet={secrets.firebase_service_account}
        multiline
      />
    </>
  )
}
