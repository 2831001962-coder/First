import { clearLedger, formatTokens, formatYuan, useFactory } from '../lib/factory'
import { getLine } from '../data/lines'

export function LedgerPage() {
  const factory = useFactory()

  return (
    <div className="page ledger-page">
      <header className="page-head">
        <p className="brand-sm">词元工厂</p>
        <h1>生产台账</h1>
        <p className="muted">按词元计量，批次可追溯</p>
      </header>

      <div className="metric-row">
        <div className="metric">
          <span className="metric-label">总产出</span>
          <span className="metric-value mono">{formatTokens(factory.totalOutputTokens)}</span>
        </div>
        <div className="metric">
          <span className="metric-label">总费用</span>
          <span className="metric-value mono">{formatYuan(factory.totalCostYuan)}</span>
        </div>
        <div className="metric">
          <span className="metric-label">批次</span>
          <span className="metric-value mono">{factory.totalBatches}</span>
        </div>
      </div>

      {factory.batches.length === 0 ? (
        <div className="empty-state">
          <p>尚无生产记录</p>
          <p className="muted">去生产台下一张工单，台账会自动记账。</p>
        </div>
      ) : (
        <>
          <div className="ledger-toolbar">
            <span>{factory.batches.length} 条最近记录</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={clearLedger}>
              清空台账
            </button>
          </div>
          <ul className="batch-list">
            {factory.batches.map((b) => {
              const line = getLine(b.lineId)
              return (
                <li key={b.id} className="batch-item">
                  <div className="batch-top">
                    <span className="batch-id mono">{b.id}</span>
                    <span className="batch-line" style={{ color: line.accent }}>
                      {line.name}
                    </span>
                  </div>
                  <p className="batch-prompt">{b.prompt}</p>
                  <p className="batch-reply">{b.reply}</p>
                  <div className="batch-meta mono">
                    <span>入 {b.inputTokens}</span>
                    <span>出 {b.outputTokens}</span>
                    <span>{(b.durationMs / 1000).toFixed(2)}s</span>
                    <span>{formatYuan(b.costYuan)}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
