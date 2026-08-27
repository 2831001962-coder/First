import { useEffect } from 'react'
import { daysUntil, useProgress } from '../lib/progress'
import {
  fireStudyNotification,
  shouldFireBrowserNotification,
  useReminder,
} from '../lib/reminder'

/**
 * While the app tab is open, check periodically whether to fire
 * today's browser notification (requires prior permission + enabled reminder).
 */
export function ReminderScheduler() {
  const reminder = useReminder()
  const progress = useProgress()
  const days = daysUntil(progress.examDate)

  useEffect(() => {
    const tick = () => {
      if (shouldFireBrowserNotification(reminder, progress.lastStudyDate)) {
        fireStudyNotification(days)
      }
    }
    tick()
    const id = window.setInterval(tick, 30_000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [reminder, progress.lastStudyDate, days])

  return null
}
