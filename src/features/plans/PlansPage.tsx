import { CheckOutlined, EditOutlined, EyeInvisibleOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Card, Col, Empty, Flex, Row, Skeleton, Tag, Typography } from 'antd'
import { useState } from 'react'

import type { Plan } from '../../api/types'
import { formatMoney, formatNumber } from '../../shared/format'
import { PageHeader } from '../../shared/PageHeader'
import { useCurrency, useList, useMeta } from '../../shared/queries'
import { PlanModal } from './PlanModal'

const limit = (value: number) => (value === 0 ? 'Illimité' : formatNumber(value))

export function PlansPage() {
  const currency = useCurrency()
  const { data: meta } = useMeta()
  const { data: plans, isLoading } = useList<Plan[]>('plans')
  const [editing, setEditing] = useState<Plan | null | undefined>(undefined)
  const featureLabel = (key: string) => meta?.plan_features.find((f) => f.value === key)?.label ?? key

  return (
    <>
      <PageHeader
        title="Plans"
        subtitle="Formules d'abonnement proposées aux organisations."
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing(null)}>Nouveau plan</Button>}
      />
      {isLoading ? (
        <Skeleton active />
      ) : !plans?.length ? (
        <Empty description="Aucun plan" />
      ) : (
        <Row gutter={[16, 16]}>
          {plans.map((plan) => (
            <Col key={plan.id} xs={24} md={12} xl={8}>
              <Card
                title={plan.name}
                extra={
                  <Button type="text" icon={<EditOutlined />} onClick={() => setEditing(plan)} aria-label="Modifier" />
                }
                style={{ height: '100%' }}
              >
                <Flex vertical gap={12}>
                  <div>
                    <Typography.Title level={3} style={{ margin: 0 }}>
                      {plan.price ? formatMoney(plan.price, currency) : 'Sur devis'}
                    </Typography.Title>
                    {plan.price > 0 && <Typography.Text type="secondary">par mois</Typography.Text>}
                  </div>
                  {plan.description && <Typography.Text type="secondary">{plan.description}</Typography.Text>}
                  <Flex gap={8} wrap>
                    <Tag>Fermes : {limit(plan.max_farms)}</Tag>
                    <Tag>Téléphones : {limit(plan.max_devices)}</Tag>
                    <Tag>Sujets : {limit(plan.max_birds)}</Tag>
                  </Flex>
                  <Flex gap={6} wrap>
                    {plan.features.map((key) => (
                      <Tag key={key} color="success" icon={<CheckOutlined />}>{featureLabel(key)}</Tag>
                    ))}
                  </Flex>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Code <Typography.Text code>{plan.code}</Typography.Text>
                    {!plan.is_public && <> · <EyeInvisibleOutlined /> Non proposé dans l'application</>}
                  </Typography.Text>
                </Flex>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      <PlanModal plan={editing} onClose={() => setEditing(undefined)} />
    </>
  )
}
