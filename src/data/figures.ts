/** Declarative SVG primitives for 图形推理 panels (viewBox 0 0 100 100). */

export type FigPrim =
  | { t: 'circle'; cx: number; cy: number; r: number; fill?: string; stroke?: string; sw?: number }
  | { t: 'line'; x1: number; y1: number; x2: number; y2: number; stroke?: string; sw?: number }
  | { t: 'rect'; x: number; y: number; w: number; h: number; fill?: string; stroke?: string; sw?: number; rx?: number }
  | { t: 'poly'; points: string; fill?: string; stroke?: string; sw?: number }
  | { t: 'path'; d: string; fill?: string; stroke?: string; sw?: number }
  | {
      t: 'group'
      rotate?: number
      cx?: number
      cy?: number
      children: FigPrim[]
    }

export type FigurePanel = {
  /** Shown under the panel; use "?" for the blank. */
  label?: string
  isBlank?: boolean
  elements: FigPrim[]
}

const ink = '#163d52'
const fillSoft = 'none'

/** Circle divided by n diameters (through center). */
export function circleWithLines(n: number): FigPrim[] {
  const lines: FigPrim[] = []
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * i) / Math.max(n, 1)
    const x1 = 50 + 36 * Math.cos(a)
    const y1 = 50 + 36 * Math.sin(a)
    const x2 = 50 - 36 * Math.cos(a)
    const y2 = 50 - 36 * Math.sin(a)
    lines.push({ t: 'line', x1, y1, x2, y2, stroke: ink, sw: 2 })
  }
  return [
    { t: 'circle', cx: 50, cy: 50, r: 36, fill: fillSoft, stroke: ink, sw: 2.5 },
    ...lines,
  ]
}

/** Triangle pointing in a direction, optionally rotated. */
export function triangleAt(angleDeg: number): FigPrim[] {
  return [
    {
      t: 'group',
      rotate: angleDeg,
      cx: 50,
      cy: 50,
      children: [
        {
          t: 'poly',
          points: '50,18 78,78 22,78',
          fill: fillSoft,
          stroke: ink,
          sw: 2.5,
        },
      ],
    },
  ]
}

/** Arrow pointing up, then rotated. */
export function arrowAt(angleDeg: number): FigPrim[] {
  return [
    {
      t: 'group',
      rotate: angleDeg,
      cx: 50,
      cy: 50,
      children: [
        { t: 'line', x1: 50, y1: 78, x2: 50, y2: 28, stroke: ink, sw: 2.5 },
        { t: 'poly', points: '50,18 62,36 38,36', fill: ink, stroke: ink, sw: 1 },
      ],
    },
  ]
}

/** Black dot in a 3×3 grid cell (0–8, row-major). */
export function gridDot(cell: number, showGrid = true): FigPrim[] {
  const els: FigPrim[] = []
  if (showGrid) {
    els.push(
      { t: 'rect', x: 14, y: 14, w: 72, h: 72, fill: 'none', stroke: ink, sw: 1.5 },
      { t: 'line', x1: 38, y1: 14, x2: 38, y2: 86, stroke: ink, sw: 1.2 },
      { t: 'line', x1: 62, y1: 14, x2: 62, y2: 86, stroke: ink, sw: 1.2 },
      { t: 'line', x1: 14, y1: 38, x2: 86, y2: 38, stroke: ink, sw: 1.2 },
      { t: 'line', x1: 14, y1: 62, x2: 86, y2: 62, stroke: ink, sw: 1.2 },
    )
  }
  const col = cell % 3
  const row = Math.floor(cell / 3)
  const cx = 26 + col * 24
  const cy = 26 + row * 24
  els.push({ t: 'circle', cx, cy, r: 7, fill: ink, stroke: ink, sw: 1 })
  return els
}

/** Nested shapes count: 1 circle, 2 = circle+square, 3 = +triangle. */
export function nestedShapes(n: number): FigPrim[] {
  const els: FigPrim[] = []
  if (n >= 1) els.push({ t: 'circle', cx: 50, cy: 50, r: 34, fill: 'none', stroke: ink, sw: 2.2 })
  if (n >= 2) els.push({ t: 'rect', x: 28, y: 28, w: 44, h: 44, fill: 'none', stroke: ink, sw: 2.2 })
  if (n >= 3)
    els.push({ t: 'poly', points: '50,24 72,70 28,70', fill: 'none', stroke: ink, sw: 2.2 })
  if (n >= 4)
    els.push({ t: 'circle', cx: 50, cy: 50, r: 10, fill: 'none', stroke: ink, sw: 2.2 })
  return els
}

/** Two overlapping shapes for 叠加规律. */
export function overlapLeft(): FigPrim[] {
  return [
    { t: 'circle', cx: 38, cy: 50, r: 22, fill: 'none', stroke: ink, sw: 2.2 },
    { t: 'rect', x: 42, y: 28, w: 36, h: 44, fill: 'none', stroke: ink, sw: 2.2 },
  ]
}

export function overlapRight(): FigPrim[] {
  return [
    { t: 'poly', points: '50,22 78,78 22,78', fill: 'none', stroke: ink, sw: 2.2 },
  ]
}

export function overlapResult(): FigPrim[] {
  return [
    { t: 'circle', cx: 38, cy: 50, r: 22, fill: 'none', stroke: ink, sw: 2.2 },
    { t: 'rect', x: 42, y: 28, w: 36, h: 44, fill: 'none', stroke: ink, sw: 2.2 },
    { t: 'poly', points: '50,22 78,78 22,78', fill: 'none', stroke: ink, sw: 2.2 },
  ]
}

export function overlapWrongA(): FigPrim[] {
  return [
    { t: 'circle', cx: 50, cy: 50, r: 28, fill: 'none', stroke: ink, sw: 2.2 },
    { t: 'rect', x: 32, y: 32, w: 36, h: 36, fill: 'none', stroke: ink, sw: 2.2 },
  ]
}

export function overlapWrongB(): FigPrim[] {
  return [{ t: 'poly', points: '50,22 78,78 22,78', fill: 'none', stroke: ink, sw: 2.2 }]
}

export function overlapWrongC(): FigPrim[] {
  return [
    { t: 'circle', cx: 50, cy: 42, r: 20, fill: 'none', stroke: ink, sw: 2.2 },
    { t: 'rect', x: 30, y: 55, w: 40, h: 22, fill: 'none', stroke: ink, sw: 2.2 },
  ]
}

/** Axis-symmetric vs centrosymmetric figures. */
export function mirrorVertical(): FigPrim[] {
  return [
    { t: 'line', x1: 50, y1: 18, x2: 50, y2: 82, stroke: '#8aa0ad', sw: 1 },
    { t: 'poly', points: '50,22 72,50 50,78 28,50', fill: 'none', stroke: ink, sw: 2.2 },
  ]
}

export function centrosym(): FigPrim[] {
  return [
    { t: 'path', d: 'M30,30 L70,30 L70,50 L50,50 L50,70 L30,70 Z', fill: 'none', stroke: ink, sw: 2.2 },
  ]
}

export function asymmetric(): FigPrim[] {
  return [
    { t: 'poly', points: '30,25 75,35 60,80 25,70', fill: 'none', stroke: ink, sw: 2.2 },
  ]
}

export function mirrorHorizontal(): FigPrim[] {
  return [
    { t: 'line', x1: 18, y1: 50, x2: 82, y2: 50, stroke: '#8aa0ad', sw: 1 },
    { t: 'poly', points: '22,50 50,28 78,50 50,72', fill: 'none', stroke: ink, sw: 2.2 },
  ]
}

/** Closed regions: polygon with internal lines creating n regions. */
export function closedRegions(n: number): FigPrim[] {
  const base: FigPrim[] = [
    { t: 'circle', cx: 50, cy: 50, r: 34, fill: 'none', stroke: ink, sw: 2.2 },
  ]
  if (n === 1) return base
  if (n === 2) {
    return [...base, { t: 'line', x1: 16, y1: 50, x2: 84, y2: 50, stroke: ink, sw: 2 }]
  }
  if (n === 3) {
    return [
      ...base,
      { t: 'line', x1: 16, y1: 50, x2: 84, y2: 50, stroke: ink, sw: 2 },
      { t: 'line', x1: 50, y1: 16, x2: 50, y2: 50, stroke: ink, sw: 2 },
    ]
  }
  // 4 regions
  return [
    ...base,
    { t: 'line', x1: 16, y1: 50, x2: 84, y2: 50, stroke: ink, sw: 2 },
    { t: 'line', x1: 50, y1: 16, x2: 50, y2: 84, stroke: ink, sw: 2 },
  ]
}

/** Element traversal: ★ ○ △ cycling positions. */
export function threeElements(order: [string, string, string]): FigPrim[] {
  const map: Record<string, (x: number, y: number) => FigPrim> = {
    star: (x, y) => ({
      t: 'poly',
      points: `${x},${y - 12} ${x + 3},${y - 3} ${x + 12},${y - 3} ${x + 5},${y + 3} ${x + 8},${y + 12} ${x},${y + 6} ${x - 8},${y + 12} ${x - 5},${y + 3} ${x - 12},${y - 3} ${x - 3},${y - 3}`,
      fill: ink,
      stroke: ink,
      sw: 1,
    }),
    circle: (x, y) => ({ t: 'circle', cx: x, cy: y, r: 10, fill: 'none', stroke: ink, sw: 2.2 }),
    tri: (x, y) => ({
      t: 'poly',
      points: `${x},${y - 11} ${x + 11},${y + 9} ${x - 11},${y + 9}`,
      fill: 'none',
      stroke: ink,
      sw: 2.2,
    }),
  }
  const positions = [
    [28, 50],
    [50, 50],
    [72, 50],
  ] as const
  return order.map((k, i) => map[k](positions[i][0], positions[i][1]))
}
