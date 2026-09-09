import { useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { TokenBelt } from '../components/TokenBelt'
import {
  estimateCost,
  formatYuan,
  getSelectedLineId,
  recordBatch,
  setSelectedLineId,
  useSelectedLine,
} from '../lib/factory'
import { craftReply, tokenize, type TokenPiece } from '../lib/tokenizer'
import { LINES, type LineId } from '../data/lines'

type Phase = 'idle' | 'warming' | 'streaming' | 'done'

const PROMPTS = [
  '用一句话解释什么是词元工厂',
  '帮我写一段产品介绍：按 Token 计费的 AI 服务',
  '对比算力租赁和词元工厂有何不同',
]

export function ProducePage() {
  const line = useSelectedLine()
  const [prompt, setPrompt] = useState(PROMPTS[0]!)
  const [phase, setPhase] = useState<Phase>('idle')
  const inputPieces = tokenize(prompt)
  const [outputPieces, setOutputPieces] = useState<TokenPiece[]>([])
  const [revealed, setRevealed] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const abortRef = useRef(0)

  const run = async () => {
    const text = prompt.trim()
    if (!text || phase === 'warming' || phase === 'streaming') return

    const runId = ++abortRef.current
    const lineId = getSelectedLineId()
    const current = LINES.find((l) => l.id === lineId)!
    const reply = craftReply(text, current.name)
    const out = tokenize(reply)
    const inCount = tokenize(text).filter((p) => p.kind !== 'space').length
    const outCount = out.filter((p) => p.kind !== 'space').length

    setPhase('warming')
    setOutputPieces([])
    setRevealed(0)
    setElapsedMs(0)

    await sleep(current.ttftMs)
    if (abortRef.current !== runId) return

    setOutputPieces(out)
    setPhase('streaming')
    const started = performance.now()
    const interval = Math.max(12, Math.round(1000 / current.tps))

    for (let i = 1; i <= out.length; i++) {
      if (abortRef.current !== runId) return
      setRevealed(i)
      setElapsedMs(performance.now() - started)
      await sleep(interval)
    }

    const durationMs = performance.now() - started + current.ttftMs
    setElapsedMs(durationMs)
    setPhase('done')
    recordBatch({
      prompt: text,
      reply,
      lineId,
      inputTokens: inCount,
      outputTokens: outCount,
      costYuan: estimateCost(outCount, lineId),
      durationMs,
    })
  }

  const outCount = outputPieces.filter((p) => p.kind !== 'space').length
  const shownCount = outputPieces
    .slice(0, revealed)
    .filter((p) => p.kind !== 'space').length
  const cost = estimateCost(shownCount || outCount, line.id)
  const busy = phase === 'warming' || phase === 'streaming'

  return (
    <div className="page produce-page">
      <header className="page-head">
        <p className="brand-sm">词元工厂</p>
        <h1>生产台</h1>
        <p className="muted">投料 → 切词 → 流式出炉</p>
      </header>

      <div className="line-picker">
        <span className="picker-label">当前产线</span>
        <div className="picker-scroll">
          {LINES.map((l) => (
            <button
              key={l.id}
              type="button"
              className={`line-chip${line.id === l.id ? ' active' : ''}`}
              style={{ '--chip': l.accent } as CSSProperties}
              onClick={() => setSelectedLineId(l.id as LineId)}
              disabled={busy}
            >
              {l.name}
            </button>
          ))}
        </div>
        <Link to="/lines" className="muted link-inline">
          {line.codename} · {line.tps} tok/s · 详情
        </Link>
      </div>

      <label className="field">
        <span className="field-label">工单提示词</span>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          disabled={busy}
          placeholder="写下你要工厂生产的任务…"
        />
      </label>

      <div className="prompt-presets">
        {PROMPTS.map((p) => (
          <button
            key={p}
            type="button"
            className="preset"
            disabled={busy}
            onClick={() => setPrompt(p)}
          >
            {p}
          </button>
        ))}
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2>输入词元</h2>
          <span className="mono">
            {inputPieces.filter((p) => p.kind !== 'space').length} tok
          </span>
        </div>
        <TokenBelt pieces={inputPieces} revealed={inputPieces.length} />
      </section>

      <div className="furnace" data-phase={phase}>
        <div className="furnace-core" style={{ '--accent': line.accent } as CSSProperties}>
          <span className="furnace-label">
            {phase === 'idle' && '待料'}
            {phase === 'warming' && '预热中'}
            {phase === 'streaming' && '出炉中'}
            {phase === 'done' && '本批完成'}
          </span>
          <div className="furnace-ring" aria-hidden />
        </div>
        <button type="button" className="btn btn-primary btn-block" onClick={run} disabled={busy || !prompt.trim()}>
          {busy ? '生产中…' : phase === 'done' ? '再产一批' : '开工'}
        </button>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2>输出词元</h2>
          <span className="mono">
            {shownCount}
            {phase === 'streaming' ? ` / ${outCount}` : outCount ? ` tok` : ''}
          </span>
        </div>
        <TokenBelt pieces={outputPieces} revealed={revealed} pulsing={busy} />
      </section>

      {(phase === 'streaming' || phase === 'done') && (
        <div className="live-stats">
          <div>
            <span className="label">耗时</span>
            <span className="mono">{(elapsedMs / 1000).toFixed(2)}s</span>
          </div>
          <div>
            <span className="label">费用</span>
            <span className="mono">{formatYuan(cost)}</span>
          </div>
          <div>
            <span className="label">首词元</span>
            <span className="mono">{line.ttftMs}ms</span>
          </div>
        </div>
      )}
    </div>
  )
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}
