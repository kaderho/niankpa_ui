import { Card, Statistic, Typography } from 'antd'
import { Link } from 'react-router-dom'

interface Props {
  title: string
  value: number
  /** Précision sous le chiffre (« dont 3 à vérifier »). */
  hint?: React.ReactNode
  to?: string
}

/** Un chiffre du tableau de bord, cliquable quand il mène à sa rubrique. */
export function StatTile({ title, value, hint, to }: Props) {
  const body = (
    <>
      <Statistic title={title} value={value} groupSeparator=" " />
      {hint && (
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {hint}
        </Typography.Text>
      )}
    </>
  )
  return (
    <Card size="small" hoverable={Boolean(to)} style={{ height: '100%' }}>
      {to ? <Link to={to}>{body}</Link> : body}
    </Card>
  )
}

/** Titre d'une rubrique du tableau de bord, le même que dans le menu. */
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography.Title level={5} style={{ margin: '8px 0 0' }}>
      {children}
    </Typography.Title>
  )
}
