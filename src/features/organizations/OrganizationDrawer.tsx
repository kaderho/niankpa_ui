import { Drawer, Flex, Skeleton, Tabs, Typography } from 'antd'
import { useQuery } from '@tanstack/react-query'

import { api } from '../../api/client'
import type { Organization } from '../../api/types'
import { StatusTag } from '../../shared/StatusTag'
import { DevicesTab } from './DevicesTab'
import { FarmsTab } from './FarmsTab'
import { OrganizationForm } from './OrganizationForm'
import { OrganizationPayments } from './OrganizationPayments'

/** Fiche d'une organisation, ouverte par-dessus la liste. */
export function OrganizationDrawer({ id, onClose }: { id?: string; onClose: () => void }) {
  const { data: organization } = useQuery({
    queryKey: ['organizations', id],
    queryFn: () => api<Organization>('get', `/bo/organizations/${id}/`),
    enabled: Boolean(id),
  })

  return (
    <Drawer
      open={Boolean(id)}
      onClose={onClose}
      size={720}
      destroyOnHidden
      title={
        organization && (
          <Flex align="center" gap={12}>
            <span>{organization.name || 'Sans nom'}</span>
            <StatusTag status={organization.status} />
          </Flex>
        )
      }
    >
      {!organization ? (
        <Skeleton active />
      ) : (
        <>
          <Typography.Paragraph type="secondary">
            Code de rattachement : <Typography.Text code copyable>{organization.code}</Typography.Text>
            {' · '}Propriétaire : {organization.owner_phone ?? '—'}
          </Typography.Paragraph>
          <Tabs
            items={[
              { key: 'info', label: 'Abonnement', children: <OrganizationForm organization={organization} /> },
              { key: 'payments', label: 'Paiements', children: <OrganizationPayments organization={organization} /> },
              { key: 'farms', label: `Fermes (${organization.farms_count})`, children: <FarmsTab id={organization.id} /> },
              { key: 'devices', label: `Téléphones (${organization.devices_count})`, children: <DevicesTab id={organization.id} /> },
            ]}
          />
        </>
      )}
    </Drawer>
  )
}
