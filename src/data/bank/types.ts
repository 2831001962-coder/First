import type { FigureId } from '../../components/figures/PatternFigures'

/** 客观题科目：行测、专业知识（申论单独维护） */
export type SubjectId = 'xingce' | 'zhuanye'

export type XingceCategoryId =
  | 'yuyan'
  | 'shuliang'
  | 'panduan'
  | 'ziliao'
  | 'changshi'

export type ZhuanyeCategoryId =
  | 'falv'
  | 'kuaiji'
  | 'jisuanji'
  | 'jinrong'
  | 'gongan'
  | 'waiyu'

export type CategoryId = XingceCategoryId | ZhuanyeCategoryId

export type Question = {
  id: string
  subject: SubjectId
  category: CategoryId
  stem: string
  options: string[]
  answer: number
  explanation: string
  difficulty: 1 | 2 | 3
  tags?: string[]
  figure?: FigureId
  optionFigures?: FigureId[]
}

export type QuestionPackMeta = {
  id: string
  subject: SubjectId
  category: CategoryId
  name: string
  description?: string
  version: number
}

export type QuestionPack = {
  meta: QuestionPackMeta
  questions: Omit<Question, 'subject' | 'category'>[]
}

export type BankStats = {
  totalObjective: number
  xingce: number
  zhuanye: number
  shenlun: number
  byCategory: Record<string, number>
  packCount: number
}
