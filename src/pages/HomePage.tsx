import { Link } from 'react-router-dom'
import { ReminderBanner } from '../components/ReminderBanner'
import { SampleBadge } from '../components/SampleBadge'
import { CATEGORIES, QUESTIONS, type CategoryId } from '../data/questions'
import { daysUntil, useProgress } from '../lib/progress'
import { formatReminderTimeLabel, hasStudiedToday, useReminder } from '../lib/reminder'

export function HomePage() {
  const progress = useProgress()
  const reminder = useReminder()
  const days = daysUntil(progress.examDate)
  const answeredCount = Object.keys(progress.answered).length
  const correctCount = Object.values(progress.answered).filter((a) => a.correct).length
  const accuracy = answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0
  const studiedToday = hasStudiedToday(progress.lastStudyDate)

  const weak = (Object.keys(CATEGORIES) as CategoryId[])
    .map((id) => {
      const qs = QUESTIONS.filter((q) => q.category === id)
      const done = qs.filter((q) => progress.answered[q.id])
      const wrong = done.filter((q) => !progress.answered[q.id]?.correct).length
      return { id, wrong, total: qs.length, done: done.length }
    })
    .sort((a, b) => b.wrong - a.wrong)[0]

  return (
    <div className="page">
      <SampleBadge />
      <ReminderBanner />

      <header className="hero-home">
        <p className="brand">岸途</p>
        <p className="tagline">行测日拱一卒，申论落笔成章。向岸而行，稳稳上岸。</p>
        <div className="wave-line" aria-hidden />
        <div className="cta-row">
          <Link className="btn btn-primary" to="/practice/quiz?mode=daily">
            今日练题
          </Link>
          <Link className="btn btn-ghost" to="/practice/mock">
            模拟测验
          </Link>
        </div>
      </header>

      <div className="countdown-strip">
        <div className="stat-pill">
          <span className="label">距考试</span>
          <span className="value">{days} 天</span>
        </div>
        <div className="stat-pill">
          <span className="label">连续打卡</span>
          <span className="value">{progress.streak} 天</span>
        </div>
        <div className="stat-pill">
          <span className="label">正确率</span>
          <span className="value">{answeredCount ? `${accuracy}%` : '—'}</span>
        </div>
      </div>

      {reminder.enabled && (
        <div className="reminder-status">
          <span className={`reminder-dot${studiedToday ? ' done' : ''}`} />
          {studiedToday
            ? '今日已打卡，提醒任务完成'
            : `每日提醒 ${formatReminderTimeLabel(reminder.time)} · 尚未打卡`}
          <Link to="/me" className="muted" style={{ marginLeft: 'auto' }}>
            设置
          </Link>
        </div>
      )}

      <section className="section">
        <div className="section-head">
          <h2>今日任务</h2>
          <p>少而精，贵在坚持</p>
        </div>
        <div className="task-list">
          <Link className="task-item" to="/practice/quiz?mode=daily">
            <div className="icon">练</div>
            <div className="body">
              <div className="title">行测精练 · 10 题</div>
              <div className="desc">覆盖五大模块，限时强化手感</div>
            </div>
          </Link>
          <Link className="task-item" to="/shenlun">
            <div className="icon">写</div>
            <div className="body">
              <div className="title">申论练笔 · 1 题</div>
              <div className="desc">看材料、列提纲、抓关键词</div>
            </div>
          </Link>
          <Link className="task-item" to="/wrong">
            <div className="icon">复</div>
            <div className="body">
              <div className="title">错题复盘 · {progress.wrongBook.length} 题</div>
              <div className="desc">
                {progress.wrongBook.length ? '趁热打铁，消灭薄弱点' : '暂无错题，保持节奏'}
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>模块入口</h2>
          <Link to="/practice" className="muted">
            全部 →
          </Link>
        </div>
        <div className="cat-grid">
          {(Object.keys(CATEGORIES) as CategoryId[]).map((id) => {
            const cat = CATEGORIES[id]
            const total = QUESTIONS.filter((q) => q.category === id).length
            const done = QUESTIONS.filter((q) => q.category === id && progress.answered[q.id]).length
            return (
              <Link key={id} className="cat-tile" to={`/practice/quiz?category=${id}`}>
                <div className="dot" style={{ background: cat.color }} />
                <span className="name">{cat.short}</span>
                <span className="meta">
                  {done}/{total} · {cat.tip}
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {weak && weak.wrong > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>薄弱提醒</h2>
          </div>
          <div className="list-card">
            <div className="eyebrow">建议优先巩固</div>
            <h3>{CATEGORIES[weak.id].name}</h3>
            <p>
              近期错题 {weak.wrong} 道。可先刷本模块，再回炉错题本。
            </p>
          </div>
        </section>
      )}
    </div>
  )
}
