import type {
  BankStats,
  CategoryId,
  Question,
  QuestionPack,
  SubjectId,
  XingceCategoryId,
  ZhuanyeCategoryId,
} from './types'
import { XINGCE_CORE } from './xingce-core'

const packModules = import.meta.glob('./packs/*.json', { eager: true }) as Record<
  string,
  { default: QuestionPack }
>

export const XINGCE_CATEGORIES: Record<
  XingceCategoryId,
  { name: string; short: string; color: string; tip: string }
> = {
  yuyan: {
    name: '言语理解与表达',
    short: '言语',
    color: 'var(--cat-yuyan)',
    tip: '抓主旨、看逻辑、辨语境',
  },
  shuliang: {
    name: '数量关系',
    short: '数量',
    color: 'var(--cat-shuliang)',
    tip: '方程、比例、特值优先',
  },
  panduan: {
    name: '判断推理',
    short: '判断',
    color: 'var(--cat-panduan)',
    tip: '图形规律、定义、类比、逻辑',
  },
  ziliao: {
    name: '资料分析',
    short: '资料',
    color: 'var(--cat-ziliao)',
    tip: '速算、增长率、比重、平均数',
  },
  changshi: {
    name: '常识判断',
    short: '常识',
    color: 'var(--cat-changshi)',
    tip: '时政、法律、科技、人文地理',
  },
}

export const ZHUANYE_CATEGORIES: Record<
  ZhuanyeCategoryId,
  { name: string; short: string; color: string; tip: string; positions: string }
> = {
  falv: {
    name: '法律专业知识',
    short: '法律',
    color: 'var(--cat-falv)',
    tip: '宪法·行政法·民法·刑法',
    positions: '司法行政、法治类岗位',
  },
  kuaiji: {
    name: '财会审计',
    short: '财会',
    color: 'var(--cat-kuaiji)',
    tip: '会计·审计·财务管理',
    positions: '审计署、财政类岗位',
  },
  jisuanji: {
    name: '计算机',
    short: '计算机',
    color: 'var(--cat-jisuanji)',
    tip: '网络·数据库·信息安全',
    positions: '网信、信息化类岗位',
  },
  jinrong: {
    name: '金融监管',
    short: '金融',
    color: 'var(--cat-jinrong)',
    tip: '银行·证券·保险监管',
    positions: '金融监管总局、证监会类岗位',
  },
  gongan: {
    name: '公安基础',
    short: '公安',
    color: 'var(--cat-gongan)',
    tip: '执法规范·警种基础',
    positions: '公安机关人民警察职位加试',
  },
  waiyu: {
    name: '外语',
    short: '外语',
    color: 'var(--cat-waiyu)',
    tip: '阅读·翻译·法律英语',
    positions: '外交部、商务外语类岗位',
  },
}

export const SUBJECTS = {
  xingce: { name: '行政职业能力测验', short: '行测' },
  zhuanye: { name: '专业知识', short: '专业' },
  shenlun: { name: '申论', short: '申论' },
} as const

function loadPackQuestions(): Question[] {
  const out: Question[] = []
  for (const mod of Object.values(packModules)) {
    const pack = mod.default
    for (const q of pack.questions) {
      out.push({
        ...q,
        subject: pack.meta.subject,
        category: pack.meta.category,
      })
    }
  }
  return out
}

const PACK_QUESTIONS = loadPackQuestions()

/** 全库客观题（行测 + 专业，去重 id） */
export const ALL_QUESTIONS: Question[] = (() => {
  const map = new Map<string, Question>()
  for (const q of [...XINGCE_CORE, ...PACK_QUESTIONS]) {
    map.set(q.id, q)
  }
  return [...map.values()]
})()

export function getBankStats(shenlunCount: number): BankStats {
  const byCategory: Record<string, number> = {}
  for (const q of ALL_QUESTIONS) {
    byCategory[q.category] = (byCategory[q.category] ?? 0) + 1
  }
  const xingce = ALL_QUESTIONS.filter((q) => q.subject === 'xingce').length
  const zhuanye = ALL_QUESTIONS.filter((q) => q.subject === 'zhuanye').length
  return {
    totalObjective: ALL_QUESTIONS.length,
    xingce,
    zhuanye,
    shenlun: shenlunCount,
    byCategory,
    packCount: Object.keys(packModules).length + 1,
  }
}

export function getQuestionsBySubject(subject: SubjectId): Question[] {
  return ALL_QUESTIONS.filter((q) => q.subject === subject)
}

export function getQuestionsByCategory(subject: SubjectId, category: CategoryId): Question[] {
  return ALL_QUESTIONS.filter((q) => q.subject === subject && q.category === category)
}

export function getQuestionById(id: string): Question | undefined {
  return ALL_QUESTIONS.find((q) => q.id === id)
}

export function listPacks(): QuestionPack['meta'][] {
  const metas = Object.values(packModules).map((m) => m.default.meta)
  return metas
}

export type {
  Question,
  CategoryId,
  SubjectId,
  XingceCategoryId,
  ZhuanyeCategoryId,
  BankStats,
} from './types'
export const CATEGORIES = XINGCE_CATEGORIES
export const QUESTIONS = ALL_QUESTIONS.filter((q) => q.subject === 'xingce')

export function getXingceQuestionsByCategory(category: XingceCategoryId | 'all'): Question[] {
  const list = ALL_QUESTIONS.filter((q) => q.subject === 'xingce')
  if (category === 'all') return list
  return list.filter((q) => q.category === category)
}
