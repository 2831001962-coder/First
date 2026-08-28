import { useState } from 'react'
import { Link } from 'react-router-dom'
import { QUESTIONS } from '../data/questions'
import {
  daysUntil,
  resetProgress,
  setExamDate,
  setExamType,
  useProgress,
} from '../lib/progress'
import {
  EXAM_TYPES,
  formatExamDateLabel,
  nextExamDateForType,
  type ExamType,
} from '../lib/exam'
import {
  fireStudyNotification,
  formatReminderTimeLabel,
  requestNotificationPermission,
  setReminderEnabled,
  setReminderTime,
  useReminder,
} from '../lib/reminder'

export function MePage() {
  const progress = useProgress()
  const reminder = useReminder()
  const answered = Object.keys(progress.answered).length
  const correct = Object.values(progress.answered).filter((a) => a.correct).length
  const accuracy = answered ? Math.round((correct / answered) * 100) : 0
  const days = daysUntil(progress.examDate)
  const [permHint, setPermHint] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const notifSupported = typeof Notification !== 'undefined'
  const permission = notifSupported ? Notification.permission : 'unsupported'

  async function enableReminder() {
    setBusy(true)
    setPermHint(null)
    try {
      if (!notifSupported) {
        setReminderEnabled(true)
        setPermHint('当前环境不支持系统通知，仍会在打开 App 时显示站内提醒。')
        return
      }
      const result = await requestNotificationPermission()
      setReminderEnabled(true)
      if (result === 'granted') {
        setPermHint(`已开启。每天 ${formatReminderTimeLabel(reminder.time)} 若未打卡将推送通知。`)
      } else if (result === 'denied') {
        setPermHint('系统通知被拒绝，仍可使用站内提醒。可在浏览器设置中重新允许。')
      } else {
        setPermHint('已开启站内提醒。授权通知后可收到系统推送。')
      }
    } finally {
      setBusy(false)
    }
  }

  async function onToggle(next: boolean) {
    if (next) await enableReminder()
    else {
      setReminderEnabled(false)
      setPermHint(null)
    }
  }

  async function onTestNotify() {
    setBusy(true)
    try {
      const result = await requestNotificationPermission()
      if (result !== 'granted') {
        setPermHint(result === 'denied' ? '通知权限已被拒绝。' : '需要先允许通知权限。')
        return
      }
      // Force a visible test without consuming today's "already notified" gate permanently
      // by using a one-off Notification; still mark so daily flow is consistent if enabled.
      try {
        new Notification('岸途 · 提醒测试', {
          body: '通知通道正常。到点且未打卡时会收到每日提醒。',
          icon: '/favicon.svg',
          tag: 'antu-test',
        })
        setPermHint('已发送测试通知。')
      } catch {
        fireStudyNotification(days)
        setPermHint('已尝试发送测试通知。')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">我的岸途</h1>
      <p className="page-sub">学习数据保存在本机，换设备需重新积累</p>

      <div className="profile-card">
        <div className="brand-mark" style={{ fontSize: '1.6rem', marginBottom: 4 }}>
          上岸进度
        </div>
        <p className="muted">
          目标：{formatExamDateLabel(progress.examDate, progress.examType)} · 还有 {days} 天 · 已学约{' '}
          {progress.totalStudyMinutes} 分钟
        </p>

        <div className="countdown-strip" style={{ marginTop: 16 }}>
          <div className="stat-pill">
            <span className="label">已做题</span>
            <span className="value">
              {answered}
              <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>/{QUESTIONS.length}</span>
            </span>
          </div>
          <div className="stat-pill">
            <span className="label">正确率</span>
            <span className="value">{answered ? `${accuracy}%` : '—'}</span>
          </div>
          <div className="stat-pill">
            <span className="label">连续</span>
            <span className="value">{progress.streak}</span>
          </div>
        </div>

        <div className="field">
          <label>备考目标</label>
          <div className="chip-row" style={{ marginBottom: 0 }}>
            {(['guokao', 'shengkao'] as ExamType[]).map((type) => (
              <button
                key={type}
                type="button"
                className={`chip${progress.examType === type ? ' active' : ''}`}
                onClick={() => setExamType(type)}
              >
                {EXAM_TYPES[type].short}
              </button>
            ))}
          </div>
          <p className="muted" style={{ marginTop: 8 }}>
            {EXAM_TYPES[progress.examType].desc}
          </p>
        </div>

        <div className="field">
          <label htmlFor="exam-date">考试日期</label>
          <input
            id="exam-date"
            type="date"
            value={progress.examDate}
            onChange={(e) => setExamDate(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-outline"
            style={{ marginTop: 8, width: '100%', fontSize: '0.85rem' }}
            onClick={() => setExamDate(nextExamDateForType(progress.examType))}
          >
            恢复为{EXAM_TYPES[progress.examType].short}默认日期
          </button>
        </div>
      </div>

      <section className="section">
        <div className="section-head">
          <h2>每日提醒</h2>
          <p>到点未打卡会提醒你</p>
        </div>
        <div className="profile-card reminder-card">
          <div className="reminder-toggle-row">
            <div>
              <div className="reminder-toggle-title">开启每日提醒</div>
              <p className="muted" style={{ marginTop: 2 }}>
                {reminder.enabled
                  ? `每天 ${formatReminderTimeLabel(reminder.time)} · ${
                      permission === 'granted'
                        ? '系统通知已开'
                        : permission === 'denied'
                          ? '仅站内提醒'
                          : notifSupported
                            ? '可授权系统通知'
                            : '站内提醒'
                    }`
                  : '关闭后不会推送'}
              </p>
            </div>
            <button
              type="button"
              className={`toggle${reminder.enabled ? ' on' : ''}`}
              role="switch"
              aria-checked={reminder.enabled}
              aria-label="开启每日提醒"
              disabled={busy}
              onClick={() => onToggle(!reminder.enabled)}
            >
              <span className="toggle-knob" />
            </button>
          </div>

          <div className="field">
            <label htmlFor="remind-time">提醒时间</label>
            <input
              id="remind-time"
              type="time"
              value={reminder.time}
              disabled={!reminder.enabled}
              onChange={(e) => setReminderTime(e.target.value || '20:00')}
            />
          </div>

          {permHint && <p className="reminder-hint">{permHint}</p>}

          {reminder.enabled && (
            <div className="quiz-actions" style={{ marginTop: 14 }}>
              <button
                className="btn btn-outline"
                type="button"
                disabled={busy}
                onClick={() => onTestNotify()}
                style={{ flex: 1 }}
              >
                发送测试通知
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>快捷入口</h2>
        </div>
        <Link className="list-card" to="/wrong">
          <h3>错题本</h3>
          <p>{progress.wrongBook.length} 道待消化</p>
        </Link>
        <Link className="list-card" to="/practice/mock">
          <h3>迷你模考</h3>
          <p>
            历史最佳{' '}
            {progress.mockBestScore !== null ? `${progress.mockBestScore} 分` : '暂无成绩'}
          </p>
        </Link>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>关于岸途</h2>
        </div>
        <div className="list-card">
          <h3>产品定位</h3>
          <p>
            面向公务员笔试备考的轻量练习工具：行测刷题、申论提纲、错题复盘与打卡进度。当前为示例题库
            MVP，可继续扩展真实题源与账号同步。
          </p>
        </div>
        <button
          className="btn btn-outline"
          type="button"
          style={{ width: '100%', marginTop: 8 }}
          onClick={() => {
            if (confirm('确定清空本地学习数据？此操作不可恢复。')) resetProgress()
          }}
        >
          清空学习数据
        </button>
      </section>
    </div>
  )
}
