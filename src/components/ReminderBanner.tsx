import { Link } from 'react-router-dom'
import { daysUntil, useProgress } from '../lib/progress'
import {
  dismissReminderBanner,
  formatReminderTimeLabel,
  shouldShowInAppBanner,
  useReminder,
} from '../lib/reminder'

export function ReminderBanner() {
  const reminder = useReminder()
  const progress = useProgress()
  const show = shouldShowInAppBanner(reminder, progress.lastStudyDate)
  const days = daysUntil(progress.examDate)

  if (!show) return null

  return (
    <div className="reminder-banner" role="status">
      <div className="reminder-banner-body">
        <div className="reminder-banner-title">每日提醒 · {formatReminderTimeLabel(reminder.time)}</div>
        <p>
          今天还没打卡
          {days > 0 ? `，距考试 ${days} 天` : ''}
          。花 15 分钟做一组题，别断签。
        </p>
        <div className="reminder-banner-actions">
          <Link className="btn btn-primary" to="/practice/quiz?mode=daily">
            立刻练题
          </Link>
          <button className="btn btn-ghost-dark" type="button" onClick={() => dismissReminderBanner()}>
            稍后
          </button>
        </div>
      </div>
    </div>
  )
}
