import { Link } from 'react-router-dom'
import { QUESTIONS } from '../data/questions'
import {
  daysUntil,
  resetProgress,
  setExamDate,
  useProgress,
} from '../lib/progress'

export function MePage() {
  const progress = useProgress()
  const answered = Object.keys(progress.answered).length
  const correct = Object.values(progress.answered).filter((a) => a.correct).length
  const accuracy = answered ? Math.round((correct / answered) * 100) : 0
  const days = daysUntil(progress.examDate)

  return (
    <div className="page">
      <h1 className="page-title">我的岸途</h1>
      <p className="page-sub">学习数据保存在本机，换设备需重新积累</p>

      <div className="profile-card">
        <div className="brand-mark" style={{ fontSize: '1.6rem', marginBottom: 4 }}>
          上岸进度
        </div>
        <p className="muted">距考试还有 {days} 天 · 已学约 {progress.totalStudyMinutes} 分钟</p>

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
          <label htmlFor="exam-date">目标考试日</label>
          <input
            id="exam-date"
            type="date"
            value={progress.examDate}
            onChange={(e) => setExamDate(e.target.value)}
          />
        </div>
      </div>

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
