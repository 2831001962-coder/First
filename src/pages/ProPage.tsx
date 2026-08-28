import { Link } from 'react-router-dom'
import {
  getBankStats,
  getQuestionsBySubject,
  ZHUANYE_CATEGORIES,
} from '../data/bank/registry'
import type { ZhuanyeCategoryId } from '../data/bank/types'
import { SHENLUN_TOPICS } from '../data/shenlun'
import { useProgress } from '../lib/progress'

export function ProPage() {
  const progress = useProgress()
  const stats = getBankStats(SHENLUN_TOPICS.length)
  const allPro = getQuestionsBySubject('zhuanye')

  return (
    <div className="page">
      <h1 className="page-title">专业知识</h1>
      <p className="page-sub">
        国考部分岗位加试 · 当前题库 {stats.zhuanye} 题（可批量导入扩充）
      </p>

      <div className="bank-overview">
        <div className="stat-pill">
          <span className="label">专业题库</span>
          <span className="value">{stats.zhuanye}</span>
        </div>
        <div className="stat-pill">
          <span className="label">方向</span>
          <span className="value" style={{ fontSize: '1rem' }}>
            6 类
          </span>
        </div>
        <div className="stat-pill">
          <span className="label">全库客观题</span>
          <span className="value">{stats.totalObjective}</span>
        </div>
      </div>

      <div className="list-card" style={{ marginTop: 16 }}>
        <h3>哪些岗位需要加试？</h3>
        <p>
          国考大多数岗位只考<strong>行测 + 申论</strong>。公安机关人民警察、金融监管、外语、部分法律财会及信息化岗位等，会在公共科目之外加试<strong>本类专业知识</strong>（具体以当年职位表为准）。
        </p>
      </div>

      <div className="task-list" style={{ margin: '18px 0' }}>
        <Link className="task-item" to="/pro/quiz?mode=daily">
          <div className="icon">专</div>
          <div className="body">
            <div className="title">专业每日一练</div>
            <div className="desc">随机 10 题，覆盖六大方向</div>
          </div>
        </Link>
      </div>

      <div className="section-head">
        <h2>按方向刷题</h2>
      </div>

      {(Object.keys(ZHUANYE_CATEGORIES) as ZhuanyeCategoryId[]).map((id) => {
        const cat = ZHUANYE_CATEGORIES[id]
        const list = allPro.filter((q) => q.category === id)
        const done = list.filter((q) => progress.answered[q.id]).length
        const pct = list.length ? Math.round((done / list.length) * 100) : 0
        return (
          <Link key={id} className="list-card" to={`/pro/quiz?category=${id}`}>
            <div className="eyebrow" style={{ color: cat.color }}>
              {cat.short}
            </div>
            <h3>{cat.name}</h3>
            <p>
              {cat.positions} · {cat.tip}
            </p>
            <p className="muted" style={{ marginTop: 6 }}>
              进度 {done}/{list.length}（{pct}%）
            </p>
            <div className="progress-track" style={{ marginTop: 8, marginBottom: 0 }}>
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </Link>
        )
      })}
    </div>
  )
}
