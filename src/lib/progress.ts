import { useCallback, useSyncExternalStore } from 'react'
import {
  defaultExamTarget,
  nextExamDateForType,
  type ExamType,
} from './exam'

const STORAGE_KEY = 'antu-progress-v1'

export type WrongItem = {
  questionId: string
  wrongCount: number
  lastWrongAt: number
}

export type ProgressState = {
  answered: Record<string, { correct: boolean; at: number }>
  wrongBook: WrongItem[]
  streak: number
  lastStudyDate: string | null
  totalStudyMinutes: number
  mockBestScore: number | null
  examType: ExamType
  examDate: string
}

const defaultState = (): ProgressState => {
  const target = defaultExamTarget()
  return {
    answered: {},
    wrongBook: [],
    streak: 0,
    lastStudyDate: null,
    totalStudyMinutes: 0,
    mockBestScore: null,
    examType: target.type,
    examDate: target.date,
  }
}

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    return { ...defaultState(), ...JSON.parse(raw) }
  } catch {
    return defaultState()
  }
}

let state = typeof window !== 'undefined' ? load() : defaultState()
const listeners = new Set<() => void>()

function emit() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return state
}

function todayKey() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function bumpStreak(next: ProgressState) {
  const today = todayKey()
  if (next.lastStudyDate === today) return
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yKey = yesterday.toISOString().slice(0, 10)
  next.streak = next.lastStudyDate === yKey ? next.streak + 1 : 1
  next.lastStudyDate = today
}

export function recordAnswer(questionId: string, correct: boolean) {
  const next = structuredClone(state)
  next.answered[questionId] = { correct, at: Date.now() }
  bumpStreak(next)

  if (!correct) {
    const existing = next.wrongBook.find((w) => w.questionId === questionId)
    if (existing) {
      existing.wrongCount += 1
      existing.lastWrongAt = Date.now()
    } else {
      next.wrongBook.push({ questionId, wrongCount: 1, lastWrongAt: Date.now() })
    }
  } else {
    next.wrongBook = next.wrongBook.filter((w) => w.questionId !== questionId)
  }

  state = next
  emit()
}

export function removeFromWrongBook(questionId: string) {
  state = {
    ...state,
    wrongBook: state.wrongBook.filter((w) => w.questionId !== questionId),
  }
  emit()
}

export function addStudyMinutes(minutes: number) {
  const next = structuredClone(state)
  next.totalStudyMinutes += minutes
  bumpStreak(next)
  state = next
  emit()
}

export function setMockBestScore(score: number) {
  const best = state.mockBestScore
  if (best !== null && score <= best) return
  state = { ...state, mockBestScore: score }
  emit()
}

export function setExamDate(date: string) {
  state = { ...state, examDate: date }
  emit()
}

export function setExamType(type: ExamType) {
  state = {
    ...state,
    examType: type,
    examDate: nextExamDateForType(type),
  }
  emit()
}

export function resetProgress() {
  state = defaultState()
  emit()
}

export function useProgress() {
  return useSyncExternalStore(subscribe, getSnapshot, defaultState)
}

export function useProgressActions() {
  return {
    recordAnswer: useCallback(recordAnswer, []),
    removeFromWrongBook: useCallback(removeFromWrongBook, []),
    addStudyMinutes: useCallback(addStudyMinutes, []),
    setMockBestScore: useCallback(setMockBestScore, []),
    setExamDate: useCallback(setExamDate, []),
    setExamType: useCallback(setExamType, []),
    resetProgress: useCallback(resetProgress, []),
  }
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000))
}
