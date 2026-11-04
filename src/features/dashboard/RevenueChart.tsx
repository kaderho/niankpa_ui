import { Empty, Flex, Tooltip, Typography, theme } from 'antd'
import dayjs from 'dayjs'

import { formatMoney } from '../../shared/format'

interface Props {
  rows: { month: string; total: number }[]
  currency: string
}

const HEIGHT = 180

/** Recettes des six derniers mois : une série, une teinte, barres fines
 *  arrondies en haut, valeur au survol. Les mois sans paiement restent à zéro. */
export function RevenueChart({ rows, currency }: Props) {
  const { token } = theme.useToken()
  const months = Array.from({ length: 6 }, (_, index) =>
    dayjs().subtract(5 - index, 'month').format('YYYY-MM'),
  )
  const totals = new Map(rows.map((row) => [row.month, row.total]))
  const max = Math.max(...months.map((month) => totals.get(month) ?? 0))
  if (max === 0) return <Empty description="Aucun paiement sur six mois" />

  return (
    <Flex
      align="flex-end"
      justify="space-around"
      gap={8}
      role="img"
      aria-label="Recettes par mois"
      style={{ height: HEIGHT + 28, borderBottom: `1px solid ${token.colorBorderSecondary}` }}
    >
      {months.map((month) => {
        const total = totals.get(month) ?? 0
        return (
          <Tooltip key={month} title={`${dayjs(month).format('MMMM YYYY')} : ${formatMoney(total, currency)}`}>
            <Flex vertical align="center" gap={6} style={{ flex: 1, cursor: 'default' }}>
              <div
                style={{
                  width: '100%',
                  maxWidth: 28,
                  height: Math.max((total / max) * HEIGHT, total ? 4 : 1),
                  background: total ? token.colorPrimary : token.colorBorder,
                  borderRadius: '4px 4px 0 0',
                }}
              />
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {dayjs(month).format('MMM')}
              </Typography.Text>
            </Flex>
          </Tooltip>
        )
      })}
    </Flex>
  )
}
