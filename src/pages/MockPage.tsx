import { Link } from 'react-router-dom'
import { useProgress } from '../lib/progress'

export function MockPage() {
  const progress = useProgress()

  return (
    <div className="page">
      <h1 className="page-title">迷你模考</h1>
      <p className="page-sub">15 题综合抽测，模拟真实节奏，做完即出分</p>

      <div className="hero-home" style={{ marginBottom: 18 }}>
        <p className="brand" style={{ fontSize: '2rem' }}>
          限时手感训练
        </p>
        <p className="tagline">覆盖五大模块，建议一气呵成，中途少查资料。</p>
        <div className="cta-row">
          <Link className="btn btn-primary" to="/practice/quiz?mode=mock">
            开始模考
          </Link>
        </div>
      </div>

      <div className="countdown-strip">
        <div className="stat-pill">
          <span className="label">题量</span>
          <span className="value">15</span>
        </div>
        <div className="stat-pill">
          <span className="label">建议用时</span>
          <span className="value">20′</span>
        </div>
        <div className="stat-pill">
          <span className="label">历史最佳</span>
          <span className="value">
            {progress.mockBestScore !== null ? `${progress.mockBestScore}` : '—'}
          </span>
        </div>
      </div>

      <section className="section">
        <div className="section-head">
          <h2>模考提示</h2>
        </div>
        <div className="list-card">
          <h3>先易后难</h3>
          <p>常识、言语可先稳分；数量、资料卡住就标记跳过。</p>
        </div>
        <div className="list-card">
          <h3>控制节奏</h3>
          <p>平均每题约 1 分钟。资料分析可预留整块时间集中处理。</p>
        </div>
      </section>
    </div>
  )
}
