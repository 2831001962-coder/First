export type LineId = 'qingyan' | 'xinghe' | 'luyan' | 'jiuzhou'

export type ProductionLine = {
  id: LineId
  name: string
  codename: string
  tagline: string
  specialty: string
  /** tokens per second under nominal load */
  tps: number
  /** yuan per 1K output tokens */
  pricePerK: number
  /** first-token latency ms */
  ttftMs: number
  /** tokens per watt relative score */
  efficiency: number
  accent: string
}

export const LINES: ProductionLine[] = [
  {
    id: 'qingyan',
    name: '青焰线',
    codename: 'QY-7B',
    tagline: '短答快产，适合对话与摘要',
    specialty: '低延迟对话',
    tps: 86,
    pricePerK: 0.008,
    ttftMs: 180,
    efficiency: 92,
    accent: '#3dcea8',
  },
  {
    id: 'xinghe',
    name: '星河线',
    codename: 'XH-32B',
    tagline: '长文推理与代码编排的主力产线',
    specialty: '复杂推理',
    tps: 42,
    pricePerK: 0.036,
    ttftMs: 420,
    efficiency: 74,
    accent: '#5b8def',
  },
  {
    id: 'luyan',
    name: '炉焰线',
    codename: 'LY-72B',
    tagline: '高产能重载，适合批处理与报告',
    specialty: '批量生产',
    tps: 28,
    pricePerK: 0.062,
    ttftMs: 680,
    efficiency: 61,
    accent: '#e8a45a',
  },
  {
    id: 'jiuzhou',
    name: '九州线',
    codename: 'JZ-MoE',
    tagline: '多专家路由，按任务自动配线',
    specialty: '智能路由',
    tps: 58,
    pricePerK: 0.024,
    ttftMs: 260,
    efficiency: 85,
    accent: '#d46b7a',
  },
]

export function getLine(id: LineId): ProductionLine {
  return LINES.find((l) => l.id === id) ?? LINES[0]
}
