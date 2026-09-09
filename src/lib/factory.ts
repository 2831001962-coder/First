import { useSyncExternalStore } from 'react'
import { getLine, type LineId } from '../data/lines'

const STORAGE_KEY = 'ciyuan-factory-v1'
const LINE_KEY = 'ciyuan-factory-line'

export type BatchRecord = {
  id: string
  prompt: string
  reply: string
  lineId: LineId
  inputTokens: number
  outputTokens: number
  costYuan: number
  durationMs: number
  createdAt: number
}

export type FactoryState = {
  batches: BatchRecord[]
  totalOutputTokens: number
  totalCostYuan: number
  totalBatches: number
}

const EMPTY: FactoryState = {
  batches: [],
  totalOutputTokens: 0,
  totalCostYuan: 0,
  totalBatches: 0,
}

let memory = load()
const listeners = new Set<() => void>()

function load(): FactoryState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...EMPTY }
    const parsed = JSON.parse(raw) as FactoryState
    return {
      batches: parsed.batches ?? [],
      totalOutputTokens: parsed.totalOutputTokens ?? 0,
      totalCostYuan: parsed.totalCostYuan ?? 0,
      totalBatches: parsed.totalBatches ?? 0,
    }
  } catch {
    return { ...EMPTY }
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memory))
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function getSnapshot() {
  return memory
}

export function useFactory() {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY)
}

export function recordBatch(batch: Omit<BatchRecord, 'id' | 'createdAt'>) {
  const record: BatchRecord = {
    ...batch,
    id: `B${Date.now().toString(36)}`,
    createdAt: Date.now(),
  }
  memory = {
    batches: [record, ...memory.batches].slice(0, 40),
    totalOutputTokens: memory.totalOutputTokens + batch.outputTokens,
    totalCostYuan: memory.totalCostYuan + batch.costYuan,
    totalBatches: memory.totalBatches + 1,
  }
  persist()
  return record
}

export function clearLedger() {
  memory = { ...EMPTY }
  persist()
}

export function getSelectedLineId(): LineId {
  const v = localStorage.getItem(LINE_KEY)
  if (v === 'qingyan' || v === 'xinghe' || v === 'luyan' || v === 'jiuzhou') return v
  return 'qingyan'
}

export function setSelectedLineId(id: LineId) {
  localStorage.setItem(LINE_KEY, id)
  listeners.forEach((l) => l())
}

export function useSelectedLine() {
  const id = useSyncExternalStore(
    (cb) => {
      window.addEventListener('storage', cb)
      listeners.add(cb)
      return () => {
        window.removeEventListener('storage', cb)
        listeners.delete(cb)
      }
    },
    getSelectedLineId,
    () => 'qingyan' as LineId,
  )
  return getLine(id)
}

export function estimateCost(outputTokens: number, lineId: LineId) {
  const line = getLine(lineId)
  return (outputTokens / 1000) * line.pricePerK
}

export function formatYuan(n: number) {
  if (n < 0.001) return '¥0.000'
  return `¥${n.toFixed(n < 0.01 ? 4 : 3)}`
}

export function formatTokens(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}
