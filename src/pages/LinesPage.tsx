import { type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { LINES, type LineId } from '../data/lines'
import { setSelectedLineId, useSelectedLine } from '../lib/factory'

export function LinesPage() {
  const selected = useSelectedLine()

  return (
    <div className="page lines-page">
      <header className="page-head">
        <p className="brand-sm">词元工厂</p>
        <h1>产线目录</h1>
        <p className="muted">不同产线对应不同模型能力与单价</p>
      </header>

      <ul className="line-list">
        {LINES.map((line) => {
          const active = selected.id === line.id
          return (
            <li key={line.id} className={`line-card${active ? ' active' : ''}`}>
              <div className="line-card-top" style={{ '--accent': line.accent } as CSSProperties}>
                <div>
                  <h2>{line.name}</h2>
                  <p className="codename mono">{line.codename}</p>
                </div>
                <span className="specialty">{line.specialty}</span>
              </div>
              <p className="line-tagline">{line.tagline}</p>
              <div className="line-specs">
                <span>
                  <em>{line.tps}</em> tok/s
                </span>
                <span>
                  <em>¥{line.pricePerK}</em> /1K
                </span>
                <span>
                  <em>{line.ttftMs}</em> ms
                </span>
                <span>
                  <em>{line.efficiency}</em> 能效
                </span>
              </div>
              <div className="line-actions">
                <button
                  type="button"
                  className={`btn ${active ? 'btn-ghost' : 'btn-primary'}`}
                  onClick={() => setSelectedLineId(line.id as LineId)}
                >
                  {active ? '使用中' : '选用此线'}
                </button>
                {active && (
                  <Link className="btn btn-ghost" to="/produce">
                    去生产
                  </Link>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      <p className="footnote">
        当前默认：{selected.name}。演示数值为本地模拟，不连接真实算力。
      </p>
    </div>
  )
}
