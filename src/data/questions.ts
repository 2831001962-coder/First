/** @deprecated 请使用 src/data/bank/registry */
export {
  ALL_QUESTIONS as QUESTIONS,
  CATEGORIES,
  XINGCE_CATEGORIES,
  ZHUANYE_CATEGORIES,
  getXingceQuestionsByCategory as getQuestionsByCategory,
  getQuestionById,
  getBankStats,
  getQuestionsBySubject,
  getQuestionsByCategory as getQuestionsBySubjectCategory,
  SUBJECTS,
} from './bank/registry'

export type {
  Question,
  CategoryId,
  SubjectId,
  XingceCategoryId,
  ZhuanyeCategoryId,
  BankStats,
} from './bank/types'

/** 行测模块 ID（兼容旧代码） */
export type { XingceCategoryId as CategoryIdXingce } from './bank/types'
