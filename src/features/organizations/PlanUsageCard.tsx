import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons'
import { Card, Descriptions, Tag, Typography } from 'antd'

import type { BirdsState, PlanUsage } from '../../api/dashboard'

// L'état ne se lit jamais à la seule couleur : une icône et un libellé.
const BIRDS: Record<BirdsState, { label: string; color: string; icon: React.ReactNode }> = {
  ok: { label: 'Marge confortable', color: 'success', icon: <CheckCircleOutlined /> },
  near: { label: 'Proche de la limite', color: 'warning', icon: <ExclamationCircleOutlined /> },
  reached: { label: 'Limite atteinte', color: 'error', icon: <CloseCircleOutlined /> },
  unlimited: { label: 'Illimité', color: 'default', icon: <MinusCircleOutlined /> },
  off: { label: 'Non appliquée (SaaS éteint)', color: 'default', icon: <MinusCircleOutlined /> },
}

function Quota({ used, limit }: { used: number; limit: number }) {
  if (!limit) return <>{used} · illimité</>
  return (
    <Typography.Text type={used >= limit ? 'danger' : undefined}>
      {used} / {limit}
    </Typography.Text>
  )
}

/** Consommation du plan. Les sujets en élevage ne se donnent jamais en
 *  chiffre : un état suffit pour expliquer un lot refusé à la synchro. */
export function PlanUsageCard({ usage }: { usage: PlanUsage }) {
  const birds = BIRDS[usage.birds]
  return (
    <Card size="small" title="Consommation du plan" style={{ marginBottom: 16 }}>
      <Descriptions size="small" column={1}>
        <Descriptions.Item label="Fermes">
          <Quota {...usage.farms} />
        </Descriptions.Item>
        <Descriptions.Item label="Téléphones actifs">
          <Quota {...usage.devices} />
        </Descriptions.Item>
        <Descriptions.Item label="Sujets en élevage">
          <Tag color={birds.color} icon={birds.icon} variant="filled">
            {birds.label}
          </Tag>
        </Descriptions.Item>
      </Descriptions>
      {usage.birds === 'reached' && (
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0, fontSize: 12 }}>
          Un nouveau lot est refusé à la synchro : passer au plan supérieur ou clôturer un lot.
        </Typography.Paragraph>
      )}
    </Card>
  )
}
