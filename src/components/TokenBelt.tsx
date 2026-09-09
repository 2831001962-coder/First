import type { TokenPiece } from '../lib/tokenizer'

type Props = {
  pieces: TokenPiece[]
  revealed: number
  pulsing?: boolean
}

export function TokenBelt({ pieces, revealed, pulsing }: Props) {
  const visible = pieces.slice(0, revealed)

  if (!visible.length) {
    return (
      <div className={`token-belt empty${pulsing ? ' pulsing' : ''}`}>
        <span className="belt-hint">词元将沿输送带逐枚出炉</span>
      </div>
    )
  }

  return (
    <div className={`token-belt${pulsing ? ' pulsing' : ''}`} aria-live="polite">
      {visible.map((p, i) => (
        <span
          key={`${i}-${p.text}`}
          className={`token-chip kind-${p.kind}`}
          style={{ animationDelay: `${Math.min(i, 12) * 18}ms` }}
        >
          {p.kind === 'space' ? '␣' : p.text}
        </span>
      ))}
    </div>
  )
}
