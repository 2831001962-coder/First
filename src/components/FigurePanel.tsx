import type { ReactNode } from 'react'
import type { FigPrim, FigurePanel as FigurePanelData } from '../data/figures'

function renderPrim(el: FigPrim, key: string): ReactNode {
  switch (el.t) {
    case 'circle':
      return (
        <circle
          key={key}
          cx={el.cx}
          cy={el.cy}
          r={el.r}
          fill={el.fill ?? 'none'}
          stroke={el.stroke ?? '#163d52'}
          strokeWidth={el.sw ?? 2}
        />
      )
    case 'line':
      return (
        <line
          key={key}
          x1={el.x1}
          y1={el.y1}
          x2={el.x2}
          y2={el.y2}
          stroke={el.stroke ?? '#163d52'}
          strokeWidth={el.sw ?? 2}
          strokeLinecap="round"
        />
      )
    case 'rect':
      return (
        <rect
          key={key}
          x={el.x}
          y={el.y}
          width={el.w}
          height={el.h}
          rx={el.rx ?? 0}
          fill={el.fill ?? 'none'}
          stroke={el.stroke ?? '#163d52'}
          strokeWidth={el.sw ?? 2}
        />
      )
    case 'poly':
      return (
        <polygon
          key={key}
          points={el.points}
          fill={el.fill ?? 'none'}
          stroke={el.stroke ?? '#163d52'}
          strokeWidth={el.sw ?? 2}
          strokeLinejoin="round"
        />
      )
    case 'path':
      return (
        <path
          key={key}
          d={el.d}
          fill={el.fill ?? 'none'}
          stroke={el.stroke ?? '#163d52'}
          strokeWidth={el.sw ?? 2}
          strokeLinejoin="round"
        />
      )
    case 'group': {
      const cx = el.cx ?? 50
      const cy = el.cy ?? 50
      const rot = el.rotate ?? 0
      return (
        <g key={key} transform={`rotate(${rot} ${cx} ${cy})`}>
          {el.children.map((c, i) => renderPrim(c, `${key}-${i}`))}
        </g>
      )
    }
    default:
      return null
  }
}

type Props = {
  panel: FigurePanelData
  size?: number
  className?: string
}

export function FigurePanelView({ panel, size = 88, className = '' }: Props) {
  return (
    <div className={`fig-panel ${className}`.trim()}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        role="img"
        aria-label={panel.isBlank ? '问号处' : panel.label ?? '图形'}
      >
        <rect x="0" y="0" width="100" height="100" fill="#f7fbfa" rx="8" />
        {panel.isBlank ? (
          <text
            x="50"
            y="58"
            textAnchor="middle"
            fontSize="36"
            fontWeight="700"
            fill="#1a6b6b"
            fontFamily="Noto Sans SC, sans-serif"
          >
            ?
          </text>
        ) : (
          panel.elements.map((el, i) => renderPrim(el, String(i)))
        )}
      </svg>
      {panel.label && !panel.isBlank && <span className="fig-label">{panel.label}</span>}
    </div>
  )
}

type StripProps = {
  panels: FigurePanelData[]
  size?: number
}

export function FigureStrip({ panels, size = 84 }: StripProps) {
  return (
    <div className="fig-strip" role="group" aria-label="题干图形">
      {panels.map((p, i) => (
        <FigurePanelView key={i} panel={p} size={size} />
      ))}
    </div>
  )
}
