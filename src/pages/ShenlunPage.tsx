import { Link } from 'react-router-dom'
import { SHENLUN_TOPICS } from '../data/shenlun'

export function ShenlunPage() {
  return (
    <div className="page">
      <h1 className="page-title">申论练笔</h1>
      <p className="page-sub">概括 · 对策 · 分析 · 大作文，先搭骨架再落笔</p>

      {SHENLUN_TOPICS.map((t) => (
        <Link key={t.id} className="list-card" to={`/shenlun/${t.id}`}>
          <div className="eyebrow">
            <span className="tag">{t.type}</span>
            {t.year}
          </div>
          <h3>{t.title}</h3>
          <p>关键词：{t.keywords.join(' · ')}</p>
        </Link>
      ))}
    </div>
  )
}
