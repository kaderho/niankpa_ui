import { Card, Tabs } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'

import { PageHeader } from '../../shared/PageHeader'
import { DeparturesTab } from './DeparturesTab'
import { EmployeesTab } from './EmployeesTab'

/** Employés des organisations : agents et fermiers reconnus à leur numéro. */
export function EmployeesPage() {
  const { tab = 'list' } = useParams()
  const navigate = useNavigate()
  return (
    <>
      <PageHeader
        title="Employés"
        subtitle="Agents et fermiers des organisations. Un employé sans fiche active est libre : une autre organisation peut l'inviter."
      />
      <Card>
        <Tabs
          activeKey={tab}
          onChange={(key) => navigate(`/employees/${key}`)}
          items={[
            { key: 'list', label: 'Employés', children: <EmployeesTab /> },
            { key: 'departures', label: 'Motifs de départ', children: <DeparturesTab /> },
          ]}
        />
      </Card>
    </>
  )
}
