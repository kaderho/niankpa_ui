import { Card, Tabs } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'

import { PageHeader } from '../../shared/PageHeader'
import { ProgramsList } from './ProgramsList'
import { BiosecurityList, EggCriteriaList, SpeciesList } from './simpleLists'
import { StandardsTab } from './StandardsTab'

const TABS = [
  { key: 'species', label: 'Espèces', children: <SpeciesList /> },
  { key: 'programs', label: 'Programmes de prophylaxie', children: <ProgramsList /> },
  { key: 'biosecurity', label: 'Biosécurité', children: <BiosecurityList /> },
  { key: 'eggs', label: 'Tri des œufs', children: <EggCriteriaList /> },
  { key: 'standards', label: 'Standards', children: <StandardsTab /> },
]

export function ReferencesPage() {
  const { tab = 'species' } = useParams()
  const navigate = useNavigate()
  return (
    <>
      <PageHeader
        title="Listes de référence"
        subtitle="Communes à toutes les fermes ; elles redescendent sur les téléphones à la synchro."
      />
      <Card>
        <Tabs activeKey={tab} items={TABS} onChange={(key) => navigate(`/references/${key}`)} destroyOnHidden />
      </Card>
    </>
  )
}
