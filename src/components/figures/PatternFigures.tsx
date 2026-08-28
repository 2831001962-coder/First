import type { ReactNode } from 'react'

export type FigureId =
  | 'seq-lines-123q'
  | 'circle-1-line'
  | 'circle-2-lines'
  | 'circle-3-lines'
  | 'circle-4-lines'
  | 'circle-2-curves'
  | 'circle-full'
  | 'triangle-3-lines'

const STROKE = '#163d52'
const FILL = '#f3f8f7'

function CircleWithLines({ lines, size = 56 }: { lines: number; size?: number }) {
  const r = size / 2 - 4
  const cx = size / 2
  const cy = size / 2
  const segments: ReactNode[] = []
  for (let i = 0; i < lines; i++) {
    const angle = (i * Math.PI) / lines
    const x1 = cx + r * Math.cos(angle)
    const y1 = cy + r * Math.sin(angle)
    const x2 = cx - r * Math.cos(angle)
    const y2 = cy - r * Math.sin(angle)
    segments.push(
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={STROKE} strokeWidth="1.8" />,
    )
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle cx={cx} cy={cy} r={r} fill={FILL} stroke={STROKE} strokeWidth="1.8" />
      {segments}
    </svg>
  )
}

function CircleWithCurves({ size = 56 }: { size?: number }) {
  const r = size / 2 - 4
  const cx = size / 2
  const cy = size / 2
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle cx={cx} cy={cy} r={r} fill={FILL} stroke={STROKE} strokeWidth="1.8" />
      <path
        d={`M ${cx - r} ${cy} Q ${cx} ${cy - r * 0.9} ${cx + r} ${cy}`}
        fill="none"
        stroke={STROKE}
        strokeWidth="1.8"
      />
      <path
        d={`M ${cx} ${cy - r} Q ${cx + r * 0.9} ${cy} ${cx} ${cy + r}`}
        fill="none"
        stroke={STROKE}
        strokeWidth="1.8"
      />
    </svg>
  )
}

function CircleFull({ size = 56 }: { size?: number }) {
  const r = size / 2 - 4
  const cx = size / 2
  const cy = size / 2
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle cx={cx} cy={cy} r={r} fill={FILL} stroke={STROKE} strokeWidth="1.8" />
    </svg>
  )
}

function TriangleWithLines({ size = 56 }: { size?: number }) {
  const pad = 6
  const x1 = size / 2
  const y1 = pad
  const x2 = pad
  const y2 = size - pad
  const x3 = size - pad
  const y3 = size - pad
  const mx1 = (x1 + x2) / 2
  const my1 = (y1 + y2) / 2
  const mx2 = (x2 + x3) / 2
  const my2 = (y2 + y3) / 2
  const mx3 = (x3 + x1) / 2
  const my3 = (y3 + y1) / 2
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <polygon
        points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`}
        fill={FILL}
        stroke={STROKE}
        strokeWidth="1.8"
      />
      <line x1={x1} y1={y1} x2={mx2} y2={my2} stroke={STROKE} strokeWidth="1.8" />
      <line x1={x2} y1={y2} x2={mx3} y2={my3} stroke={STROKE} strokeWidth="1.8" />
      <line x1={x3} y1={y3} x2={mx1} y2={my1} stroke={STROKE} strokeWidth="1.8" />
    </svg>
  )
}

function SeqLines123Q() {
  const items = [
    <CircleWithLines key="1" lines={1} size={52} />,
    <CircleWithLines key="2" lines={2} size={52} />,
    <CircleWithLines key="3" lines={3} size={52} />,
    <span key="q" className="figure-placeholder">
      ?
    </span>,
  ]
  return (
    <div className="figure-sequence">
      {items.map((item, i) => (
        <div key={i} className="figure-seq-item">
          {item}
          {i < items.length - 1 && <span className="figure-seq-arrow">→</span>}
        </div>
      ))}
    </div>
  )
}

const FIGURES: Record<FigureId, () => ReactNode> = {
  'seq-lines-123q': SeqLines123Q,
  'circle-1-line': () => <CircleWithLines lines={1} />,
  'circle-2-lines': () => <CircleWithLines lines={2} />,
  'circle-3-lines': () => <CircleWithLines lines={3} />,
  'circle-4-lines': () => <CircleWithLines lines={4} />,
  'circle-2-curves': () => <CircleWithCurves />,
  'circle-full': () => <CircleFull />,
  'triangle-3-lines': () => <TriangleWithLines />,
}

export function QuestionFigure({ id, size = 'md' }: { id: FigureId; size?: 'sm' | 'md' | 'lg' }) {
  const render = FIGURES[id]
  if (!render) return null
  return <div className={`question-figure question-figure-${size}`}>{render()}</div>
}
