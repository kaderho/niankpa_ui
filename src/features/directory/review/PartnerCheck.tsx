import { PhoneOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, App, Button, Drawer, Empty, Flex, Space, Spin, Switch, Tag, Typography } from 'antd'

import { api, errorMessage } from '../../../api/client'
import type { Partner, PartnerDuplicate } from '../../../api/types'
import { formatDateTime } from '../../../shared/format'
import { ReviewTag } from './ReviewActions'

interface Props {
  partner: Partner | null
  onClose: () => void
}

/** Accord du fournisseur : exigé pour publier une fiche proposée par une ferme. */
export function ConsentTag({ partner }: { partner: Partner }) {
  if (!partner.suggested_by) return null
  return partner.consent ? (
    <Tag color="green">Accord obtenu</Tag>
  ) : (
    <Tag color="orange">Accord à obtenir</Tag>
  )
}

/** Vérifier un fournisseur : son accord (l'équipe l'appelle), et les fiches
 *  qui lui ressemblent, pour ne pas publier un doublon. */
export function PartnerCheck({ partner, onClose }: Props) {
  const client = useQueryClient()
  const { message } = App.useApp()
  const { data: duplicates, isLoading } = useQuery({
    queryKey: ['partners', partner?.id, 'duplicates'],
    queryFn: () => api<PartnerDuplicate[]>('get', `/bo/partners/${partner!.id}/duplicates/`),
    enabled: !!partner,
  })
  const consent = useMutation({
    mutationFn: (given: boolean) =>
      api<Partner>('post', `/bo/partners/${partner!.id}/consent/`, { consent: given }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['partners'] })
      message.success('Accord enregistré.')
    },
    onError: (error) => message.error(errorMessage(error)),
  })
  const given = consent.data?.consent ?? partner?.consent ?? false

  return (
    <Drawer open={!!partner} onClose={onClose} size={520} title={partner?.name} destroyOnHidden>
      {partner && (
        <Flex vertical gap={24}>
          <Space wrap>
            <ReviewTag row={partner} />
            {partner.suggested_by_name && <Tag>Proposé par {partner.suggested_by_name}</Tag>}
          </Space>
          {partner.suggested_by ? (
            <div>
              <Typography.Title level={5}>Accord du fournisseur</Typography.Title>
              <Typography.Paragraph type="secondary">
                Appelez-le{partner.phone1 ? <> au <PhoneOutlined /> <b>{partner.phone1}</b></> : null} : il doit
                accepter d'être publié dans l'annuaire avant la vérification.
              </Typography.Paragraph>
              <Space>
                <Switch checked={given} loading={consent.isPending} onChange={(v) => consent.mutate(v)} />
                <span>{given ? 'Il accepte d\'être publié' : 'Pas encore son accord'}</span>
              </Space>
              {given && (consent.data?.consent_at ?? partner.consent_at) && (
                <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
                  Noté le {formatDateTime((consent.data?.consent_at ?? partner.consent_at)!)}
                </Typography.Paragraph>
              )}
            </div>
          ) : (
            <Alert type="info" showIcon title="Fiche créée par l'équipe : pas d'accord à noter." />
          )}
          <div>
            <Typography.Title level={5}>Doublons probables</Typography.Title>
            <Spin spinning={isLoading}>
              {!isLoading && !duplicates?.length && (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aucune fiche ne lui ressemble" />
              )}
              <Flex vertical gap={12}>
                {duplicates?.map((other) => (
                  <Flex key={other.id} justify="space-between" align="center" gap={16}>
                    <Flex vertical style={{ minWidth: 0 }}>
                      <Typography.Text strong>{other.name}</Typography.Text>
                      <Typography.Text type="secondary">
                        {[other.phone1, other.place_label].filter(Boolean).join(' · ') || '—'}
                      </Typography.Text>
                    </Flex>
                    <Space wrap>
                      {other.reasons.map((reason) => (
                        <Tag key={reason} color={reason === 'même numéro' ? 'red' : 'gold'}>{reason}</Tag>
                      ))}
                      <ReviewTag row={{ status: other.status } as Partner} />
                    </Space>
                  </Flex>
                ))}
              </Flex>
            </Spin>
          </div>
          <Button block onClick={onClose}>Fermer</Button>
        </Flex>
      )}
    </Drawer>
  )
}
