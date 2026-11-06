import { Card, Tabs } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'

import { PageHeader } from '../../shared/PageHeader'
import { GroupsTab } from './GroupsTab'
import { MembersTab } from './MembersTab'

/** Équipe Nian Kpa : qui entre dans le back-office, et ce que chacun y voit. */
export function TeamPage() {
  const { tab = 'members' } = useParams()
  const navigate = useNavigate()
  return (
    <>
      <PageHeader
        title="Équipe"
        subtitle="Comptes du back-office et leurs groupes. Un groupe ouvre des rubriques ; un super-administrateur les voit toutes."
      />
      <Card>
        <Tabs
          activeKey={tab}
          onChange={(key) => navigate(`/team/${key}`)}
          items={[
            { key: 'members', label: 'Membres', children: <MembersTab /> },
            { key: 'groups', label: 'Groupes', children: <GroupsTab /> },
          ]}
        />
      </Card>
    </>
  )
}
