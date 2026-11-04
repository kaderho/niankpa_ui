import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'

import type { OrgStatus } from '../api/types'

// L'état ne se lit jamais à la seule couleur : une icône et un libellé.
export const STATUSES: Record<OrgStatus, { label: string; color: string; icon: React.ReactNode }> = {
  trial: { label: 'Essai', color: 'processing', icon: <ClockCircleOutlined /> },
  active: { label: 'Actif', color: 'success', icon: <CheckCircleOutlined /> },
  grace: { label: 'Délai de grâce', color: 'warning', icon: <ExclamationCircleOutlined /> },
  expired: { label: 'Expiré', color: 'error', icon: <CloseCircleOutlined /> },
}
