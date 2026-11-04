import { Tag } from 'antd'

import type { OrgStatus } from '../api/types'
import { STATUSES } from './statuses'

export function StatusTag({ status }: { status: OrgStatus }) {
  const { label, color, icon } = STATUSES[status]
  return (
    <Tag color={color} icon={icon} variant="filled">
      {label}
    </Tag>
  )
}
