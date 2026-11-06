import { Card, Flex, Typography } from 'antd'
import { Link } from 'react-router-dom'

export interface CountRow {
  key: string
  label: React.ReactNode
  count: number
  to?: string
}

interface Props {
  title: string
  rows: CountRow[]
  /** Lien « Tout voir » vers la rubrique. */
  to?: string
  footer?: React.ReactNode
}

/** Petite carte « libellé … nombre », une ligne par état. */
export function CountsCard({ title, rows, to, footer }: Props) {
  return (
    <Card title={title} size="small" style={{ height: '100%' }} extra={to && <Link to={to}>Tout voir</Link>}>
      <Flex vertical gap={12}>
        {rows.map((row) => {
          const line = (
            <Flex justify="space-between" align="center">
              {row.label}
              <Typography.Text strong>{row.count}</Typography.Text>
            </Flex>
          )
          return row.to ? <Link key={row.key} to={row.to}>{line}</Link> : <div key={row.key}>{line}</div>
        })}
      </Flex>
      {footer && (
        <Typography.Paragraph type="secondary" style={{ marginTop: 12, marginBottom: 0, fontSize: 12 }}>
          {footer}
        </Typography.Paragraph>
      )}
    </Card>
  )
}
