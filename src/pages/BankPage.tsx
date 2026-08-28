import { Link } from 'react-router-dom'
import {
  getBankStats,
  SUBJECTS,
  XINGCE_CATEGORIES,
  ZHUANYE_CATEGORIES,
} from '../data/bank/registry'
import { SHENLUN_TOPICS } from '../data/shenlun'

export function BankPage() {
  const stats = getBankStats(SHENLUN_TOPICS.length)

  return (
    <div className="page">
      <h1 className="page-title">题库总览</h1>
      <p className="page-sub">国考三大科目 · 支持 JSON 批量导入扩充</p>

      <div className="bank-overview bank-overview-lg">
        <div className="stat-pill">
          <span className="label">客观题合计</span>
          <span className="value">{stats.totalObjective}</span>
        </div>
        <div className="stat-pill">
          <span className="label">申论题</span>
          <span className="value">{stats.shenlun}</span>
        </div>
        <div className="stat-pill">
          <span className="label">题包数</span>
          <span className="value">{stats.packCount}</span>
        </div>
      </div>

      <section className="section">
        <div className="section-head">
          <h2>{SUBJECTS.xingce.name}</h2>
          <span className="muted">{stats.xingce} 题</span>
        </div>
        <div className="cat-grid">
          {Object.entries(XINGCE_CATEGORIES).map(([id, cat]) => (
            <Link key={id} className="cat-tile" to={`/practice/quiz?category=${id}`}>
              <div className="dot" style={{ background: cat.color }} />
              <span className="name">{cat.short}</span>
              <span className="meta">{stats.byCategory[id] ?? 0} 题</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>{SUBJECTS.zhuanye.name}</h2>
          <Link to="/pro" className="muted">
            去刷题 →
          </Link>
        </div>
        <div className="cat-grid">
          {Object.entries(ZHUANYE_CATEGORIES).map(([id, cat]) => (
            <Link key={id} className="cat-tile" to={`/pro/quiz?category=${id}`}>
              <div className="dot" style={{ background: cat.color }} />
              <span className="name">{cat.short}</span>
              <span className="meta">{stats.byCategory[id] ?? 0} 题</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>{SUBJECTS.shenlun.name}</h2>
          <Link to="/shenlun" className="muted">
            去练笔 →
          </Link>
        </div>
        <div className="list-card">
          <h3>申论材料题</h3>
          <p>概括 · 对策 · 分析 · 大作文 · 共 {stats.shenlun} 套</p>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>扩充题库</h2>
        </div>
        <div className="list-card">
          <h3>JSON 题包导入</h3>
          <p>
            将题包放入 <code>data/import/</code>，运行{' '}
            <code>npm run import:bank</code> 合并入库。也运行{' '}
            <code>npm run seed:bank</code> 重新生成 seed 题包。
          </p>
        </div>
      </section>
    </div>
  )
}
