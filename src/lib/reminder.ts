import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'antu-reminder-v1'

export type ReminderState = {
  enabled: boolean
  time: string // HH:MM
  lastNotifiedDate: string | null
  bannerDismissedDate: string | null
}

const defaultState = (): ReminderState => ({
  enabled: false,
  time: '20:00',
  lastNotifiedDate: null,
  bannerDismissedDate: null,
})

function load(): ReminderState {
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

export function todayKey() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function useReminder() {
  return useSyncExternalStore(subscribe, getSnapshot, defaultState)
}

export function setReminderEnabled(enabled: boolean) {
  state = { ...state, enabled }
  emit()
}

export function setReminderTime(time: string) {
  state = { ...state, time }
  emit()
}

export function dismissReminderBanner() {
  state = { ...state, bannerDismissedDate: todayKey() }
  emit()
}

export function markNotifiedToday() {
  state = { ...state, lastNotifiedDate: todayKey() }
  emit()
}

/** Whether local clock is past today's reminder time. */
export function isPastReminderTime(time: string, now = new Date()): boolean {
  const [h, m] = time.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return false
  const minutesNow = now.getHours() * 60 + now.getMinutes()
  return minutesNow >= h * 60 + m
}

export function hasStudiedToday(lastStudyDate: string | null): boolean {
  return lastStudyDate === todayKey()
}

export function shouldShowInAppBanner(
  reminder: ReminderState,
  lastStudyDate: string | null,
): boolean {
  if (!reminder.enabled) return false
  if (hasStudiedToday(lastStudyDate)) return false
  if (!isPastReminderTime(reminder.time)) return false
  if (reminder.bannerDismissedDate === todayKey()) return false
  return true
}

export function shouldFireBrowserNotification(
  reminder: ReminderState,
  lastStudyDate: string | null,
): boolean {
  if (!reminder.enabled) return false
  if (hasStudiedToday(lastStudyDate)) return false
  if (!isPastReminderTime(reminder.time)) return false
  if (reminder.lastNotifiedDate === todayKey()) return false
  if (typeof Notification === 'undefined') return false
  if (Notification.permission !== 'granted') return false
  return true
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof Notification === 'undefined') return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  return Notification.requestPermission()
}

export function fireStudyNotification(daysLeft: number) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  const body =
    daysLeft > 0
      ? `今天还没打卡。距考试还有 ${daysLeft} 天，打开岸途做一组行测吧。`
      : '今天还没打卡，打开岸途保持节奏。'
  try {
    const n = new Notification('岸途 · 每日学习提醒', {
      body,
      icon: '/favicon.svg',
      tag: `antu-daily-${todayKey()}`,
      requireInteraction: false,
    })
    n.onclick = () => {
      window.focus()
      n.close()
    }
  } catch {
    /* some browsers block Notification ctor outside SW */
  }
  markNotifiedToday()
}

export function formatReminderTimeLabel(time: string): string {
  const [h, m] = time.split(':')
  return `${h}:${m}`
}
