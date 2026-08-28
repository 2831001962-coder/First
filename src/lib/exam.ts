export type ExamType = 'guokao' | 'shengkao'

export const EXAM_TYPES: Record<
  ExamType,
  { name: string; short: string; desc: string }
> = {
  guokao: {
    name: '国家公务员考试（国考）',
    short: '国考',
    desc: '中央机关及直属机构招考，笔试通常在每年 11–12 月',
  },
  shengkao: {
    name: '省级公务员考试（省考）',
    short: '省考',
    desc: '各省自主招考，多数省份笔试在每年 3–4 月',
  },
}

function formatYMD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 国考笔试一般在 11 月最后一个周末，取该月最后一个周日作默认参考日 */
export function guokaoDateForYear(year: number): string {
  let d = new Date(year, 10, 30)
  while (d.getDay() !== 0) d.setDate(d.getDate() - 1)
  return formatYMD(d)
}

/** 省考联考多在 3 月中旬，取 3 月 15 日作默认参考日 */
export function shengkaoDateForYear(year: number): string {
  return `${year}-03-15`
}

export function examDateForType(type: ExamType, year: number): string {
  return type === 'guokao' ? guokaoDateForYear(year) : shengkaoDateForYear(year)
}

/** 返回某考试类型「从今天起」最近一场的默认日期 */
export function nextExamDateForType(type: ExamType, from = new Date()): string {
  const y = from.getFullYear()
  const today = formatYMD(from)
  for (let year = y; year <= y + 2; year++) {
    const candidate = examDateForType(type, year)
    if (candidate >= today) return candidate
  }
  return examDateForType(type, y + 1)
}

/** 新用户默认：离今天最近的一场考试（国考或省考） */
export function defaultExamTarget(from = new Date()): { type: ExamType; date: string } {
  const guokao = nextExamDateForType('guokao', from)
  const shengkao = nextExamDateForType('shengkao', from)
  const toDays = (d: string) =>
    Math.ceil((new Date(d + 'T00:00:00').getTime() - from.getTime()) / 86400000)
  return toDays(guokao) <= toDays(shengkao)
    ? { type: 'guokao', date: guokao }
    : { type: 'shengkao', date: shengkao }
}

export function formatExamDateLabel(date: string, type: ExamType): string {
  const d = new Date(date + 'T00:00:00')
  const label = d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
  return `${EXAM_TYPES[type].short} · ${label}`
}
