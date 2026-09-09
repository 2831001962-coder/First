import { Link } from 'react-router-dom'
import { formatTokens, formatYuan, useFactory } from '../lib/factory'

export function HomePage() {
  const factory = useFactory()

  return (
    <div className="page home-page">
      <header className="hero">
        <div className="hero-glow" aria-hidden />
        <div className="hero-grid" aria-hidden />
        <p className="brand">词元工厂</p>
        <h1 className="hero-line">电力与数据，炼成可计量的智能。</h1>
        <p className="hero-sub">
          选产线、下工单、看词元沿输送带出炉——按用量取用 AI，像插电一样简单。
        </p>
        <div className="cta-row">
          <Link className="btn btn-primary" to="/produce">
            开工生产
          </Link>
          <Link className="btn btn-ghost" to="/lines">
            浏览产线
          </Link>
        </div>
      </header>

      <section className="section">
        <div className="section-head">
          <h2>今日产能</h2>
          <p>本地台账，演示计量</p>
        </div>
        <div className="metric-row">
          <div className="metric">
            <span className="metric-label">累计词元</span>
            <span className="metric-value mono">{formatTokens(factory.totalOutputTokens)}</span>
          </div>
          <div className="metric">
            <span className="metric-label">批次</span>
            <span className="metric-value mono">{factory.totalBatches}</span>
          </div>
          <div className="metric">
            <span className="metric-label">估算费用</span>
            <span className="metric-value mono">{formatYuan(factory.totalCostYuan)}</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>工厂如何运转</h2>
          <p>三步完成一次交付</p>
        </div>
        <ol className="step-list">
          <li>
            <strong>配线</strong>
            <span>按任务挑选对话、推理或批量产线</span>
          </li>
          <li>
            <strong>投料</strong>
            <span>写入提示词，工厂将其切分为输入词元</span>
          </li>
          <li>
            <strong>出炉</strong>
            <span>输出词元流式交付，台账自动记账</span>
          </li>
        </ol>
      </section>
    </div>
  )
}
