import { Flex, Typography, theme } from 'antd'
import { useState } from 'react'

import type { BreedWeek } from '../../../api/types'
import { formatNumber } from '../../../shared/format'

/** Couleur de la série (palette de référence, emplacement 1). */
const SERIES = '#2a78d6'
const W = 360
const H = 180
const PAD = { top: 12, right: 12, bottom: 26, left: 44 }

interface Point {
  week: number
  value: number
  low?: number
  high?: number
}

/** Graduations « rondes » de 0 au maximum. */
function ticks(max: number) {
  const raw = max / 4
  const step = [1, 2, 2.5, 5, 10].map((m) => m * 10 ** Math.floor(Math.log10(raw))).find((s) => s >= raw) ?? raw
  return Array.from({ length: Math.floor(max / step) + 1 }, (_, i) => i * step)
}

/** Une courbe semaine par semaine, avec sa fourchette si elle existe ;
 *  repère et bulle au survol. */
function MiniChart({ title, unit, points }: { title: string; unit: string; points: Point[] }) {
  const { token } = theme.useToken()
  const [hover, setHover] = useState<Point | null>(null)
  if (points.length < 2) return null
  const lastWeek = points[points.length - 1].week
  const top = Math.max(...points.map((p) => p.high ?? p.value)) * 1.05
  const grid = ticks(top)
  const yMax = grid[grid.length - 1] < top ? top : grid[grid.length - 1]
  const x = (week: number) => PAD.left + ((week - points[0].week) / (lastWeek - points[0].week)) * (W - PAD.left - PAD.right)
  const y = (v: number) => H - PAD.bottom - (v / yMax) * (H - PAD.top - PAD.bottom)
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(p.week)},${y(p.value)}`).join(' ')
  const banded = points.filter((p) => p.low != null && p.high != null)
  const band =
    banded.length > 1
      ? `${banded.map((p, i) => `${i ? 'L' : 'M'}${x(p.week)},${y(p.high!)}`).join(' ')} ` +
        `${[...banded].reverse().map((p) => `L${x(p.week)},${y(p.low!)}`).join(' ')} Z`
      : null

  const onMove = (event: React.PointerEvent<SVGRectElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    const at = ((event.clientX - box.left) / box.width) * W
    setHover(points.reduce((best, p) => (Math.abs(x(p.week) - at) < Math.abs(x(best.week) - at) ? p : best)))
  }

  return (
    <div style={{ flex: '1 1 320px', minWidth: 280, position: 'relative' }}>
      <Typography.Text strong>{title}</Typography.Text>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={title}>
        {grid.map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} stroke={token.colorBorderSecondary} strokeWidth={1} />
            <text x={PAD.left - 6} y={y(v) + 4} textAnchor="end" fontSize={10} fill={token.colorTextSecondary}>
              {formatNumber(v)}
            </text>
          </g>
        ))}
        {points.map((p) => (
          <text key={p.week} x={x(p.week)} y={H - 8} textAnchor="middle" fontSize={10} fill={token.colorTextSecondary}>
            S{p.week}
          </text>
        ))}
        {band && <path d={band} fill={SERIES} opacity={0.15} />}
        <path d={line} fill="none" stroke={SERIES} strokeWidth={2} strokeLinejoin="round" />
        {hover && (
          <>
            <line x1={x(hover.week)} x2={x(hover.week)} y1={PAD.top} y2={H - PAD.bottom} stroke={token.colorTextTertiary} strokeWidth={1} />
            <circle cx={x(hover.week)} cy={y(hover.value)} r={4} fill={SERIES} stroke={token.colorBgContainer} strokeWidth={2} />
          </>
        )}
        <rect
          x={PAD.left}
          y={PAD.top}
          width={W - PAD.left - PAD.right}
          height={H - PAD.top - PAD.bottom}
          fill="transparent"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        />
      </svg>
      {hover && (
        <div
          style={{
            position: 'absolute',
            top: 24,
            left: `${(x(hover.week) / W) * 100}%`,
            transform: x(hover.week) > W / 2 ? 'translateX(-105%)' : 'translateX(5%)',
            background: token.colorBgElevated,
            boxShadow: token.boxShadowSecondary,
            borderRadius: 6,
            padding: '4px 8px',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <Typography.Text strong>
            {formatNumber(hover.value)} {unit}
          </Typography.Text>
          {hover.low != null && hover.high != null && (
            <Typography.Text type="secondary">
              {' '}
              ({formatNumber(hover.low)} – {formatNumber(hover.high)})
            </Typography.Text>
          )}
          <br />
          <Typography.Text type="secondary">Semaine {hover.week}</Typography.Text>
        </div>
      )}
    </div>
  )
}

/** Aperçu de la courbe d'une souche : poids (avec sa fourchette) et
 *  aliment, deux graphiques séparés plutôt qu'un double axe. */
export function CurveChart({ weeks }: { weeks: BreedWeek[] }) {
  const alive = weeks.filter((w) => !w.deleted_at).sort((a, b) => a.week - b.week)
  const weight = alive
    .filter((w) => w.weight_g != null)
    .map((w) => ({ week: w.week, value: w.weight_g!, low: w.weight_min_g ?? undefined, high: w.weight_max_g ?? undefined }))
  const feed = alive.filter((w) => w.feed_g_day != null).map((w) => ({ week: w.week, value: w.feed_g_day! }))
  const lay = alive.filter((w) => w.lay_percent != null).map((w) => ({ week: w.week, value: w.lay_percent! }))
  if (weight.length < 2 && feed.length < 2 && lay.length < 2) return null
  return (
    <Flex gap={24} wrap style={{ marginBottom: 16 }}>
      <MiniChart title="Poids moyen en fin de semaine" unit="g" points={weight} />
      <MiniChart title="Aliment par sujet et par jour" unit="g" points={feed} />
      <MiniChart title="Taux de ponte" unit="%" points={lay} />
    </Flex>
  )
}
