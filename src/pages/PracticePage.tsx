import { Link } from 'react-router-dom'
import { CATEGORIES, QUESTIONS, type CategoryId } from '../data/questions'
import { useProgress } from '../lib/progress'

export function PracticePage() {
  const progress = useProgress()

  return (
    <div className="page">
      <h1 className="page-title">行测训练</h1>
      <p className="page-sub">言语 · 数量 · 判断 · 资料 · 常识，按模块突破</p>

      <div className="task-list" style={{ marginBottom: 22 }}>
        <Link className="task-item" to="/practice/quiz?mode=daily">
          <div className="icon">日</div>
          <div className="body">
            <div className="title">每日一练</div>
            <div className="desc">智能抽题 10 道，保持手感</div>
          </div>
        </Link>
        <Link className="task-item" to="/practice/mock">
          <div className="icon">模</div>
          <div className="body">
            <div className="title">迷你模考</div>
            <div className="desc">15 题限时测验，检验综合水平</div>
          </div>
        </Link>
        <Link className="task-item" to="/wrong">
          <div className="icon">错</div>
          <div className="body">
            <div className="title">错题本</div>
            <div className="desc">待消化 {progress.wrongBook.length} 题</div>
          </div>
        </Link>
      </div>

      <div className="section-head">
        <h2>按模块刷题</h2>
        <p>共 {QUESTIONS.length} 题示例题库</p>
      </div>

      {(Object.keys(CATEGORIES) as CategoryId[]).map((id) => {
        const cat = CATEGORIES[id]
        const list = QUESTIONS.filter((q) => q.category === id)
        const done = list.filter((q) => progress.answered[q.id]).length
        const pct = list.length ? Math.round((done / list.length) * 100) : 0
        return (
          <Link key={id} className="list-card" to={`/practice/quiz?category=${id}`}>
            <div className="eyebrow" style={{ color: cat.color }}>
              {cat.short}
            </div>
            <h3>{cat.name}</h3>
            <p>
              {cat.tip} · 进度 {done}/{list.length}（{pct}%）
            </p>
            <div className="progress-track" style={{ marginTop: 10, marginBottom: 0 }}>
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </Link>
        )
      })}
    </div>
  )
}
