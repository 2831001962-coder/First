/** Lightweight educational tokenizer — not a real LLM tokenizer. */

const CJK =
  /[\u3400-\u9fff\uf900-\ufaff\u3040-\u30ff\uac00-\ud7af]/
const LATIN_WORD = /[A-Za-z0-9]+(?:'[A-Za-z]+)?/
const WHITESPACE = /\s+/
const PUNCT = /[^\sA-Za-z0-9\u3400-\u9fff\uf900-\ufaff\u3040-\u30ff\uac00-\ud7af]+/

/** Common Chinese compounds kept as single tokens when present. */
const COMPOUNDS = [
  '人工智能',
  '词元工厂',
  '大模型',
  '算力',
  '数据中心',
  '按需取用',
  '推理',
  '生成',
  '调度',
  '计量',
  'Token',
  'token',
  'API',
]

export type TokenPiece = {
  text: string
  kind: 'cjk' | 'latin' | 'space' | 'punct' | 'compound'
}

export function tokenize(input: string): TokenPiece[] {
  if (!input) return []
  const pieces: TokenPiece[] = []
  let i = 0

  while (i < input.length) {
    let matched = false
    for (const c of COMPOUNDS) {
      if (input.startsWith(c, i)) {
        pieces.push({
          text: c,
          kind: /[A-Za-z]/.test(c[0]!) ? 'latin' : 'compound',
        })
        i += c.length
        matched = true
        break
      }
    }
    if (matched) continue

    const rest = input.slice(i)
    const cjk = rest.match(new RegExp(`^${CJK.source}`))
    if (cjk) {
      pieces.push({ text: cjk[0]![0]!, kind: 'cjk' })
      i += 1
      continue
    }

    const latin = rest.match(new RegExp(`^${LATIN_WORD.source}`))
    if (latin) {
      const w = latin[0]!
      if (w.length > 8) {
        const mid = Math.ceil(w.length / 2)
        pieces.push({ text: w.slice(0, mid), kind: 'latin' })
        pieces.push({ text: w.slice(mid), kind: 'latin' })
      } else {
        pieces.push({ text: w, kind: 'latin' })
      }
      i += w.length
      continue
    }

    const ws = rest.match(new RegExp(`^${WHITESPACE.source}`))
    if (ws) {
      pieces.push({ text: ws[0]!, kind: 'space' })
      i += ws[0]!.length
      continue
    }

    const punct = rest.match(new RegExp(`^${PUNCT.source}`))
    if (punct) {
      pieces.push({ text: punct[0]!, kind: 'punct' })
      i += punct[0]!.length
      continue
    }

    pieces.push({ text: input[i]!, kind: 'punct' })
    i += 1
  }

  return pieces
}

const REPLY_BANK: Array<(prompt: string) => string> = [
  (p) =>
    `收到指令「${clip(p, 24)}」。词元工厂已完成配线：电力注入算力池，模型开始连续批处理推理，正在把输入炼成可计量的输出词元。`,
  (p) =>
    `产线应答：针对「${clip(p, 28)}」，调度器选择最优专家组合，首词元已出炉，后续词元沿输送带持续交付。`,
  (p) =>
    `工厂纪要——任务摘要：${clip(p, 32)}。本批次按词元计费，无需预留整卡；产能随负载弹性伸缩，用多少产多少。`,
  (p) =>
    `关于「${clip(p, 20)}」：词元是智能服务的最小计量单位。工厂把芯片、模型与调度封装成标准 Token 服务，让应用像插电一样取用 AI。`,
]

function clip(s: string, n: number) {
  const t = s.replace(/\s+/g, ' ').trim()
  return t.length <= n ? t : `${t.slice(0, n)}…`
}

export function craftReply(prompt: string, lineName: string): string {
  const fn = REPLY_BANK[Math.abs(hash(prompt + lineName)) % REPLY_BANK.length]!
  return `${fn(prompt)}（产线：${lineName}）`
}

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return h
}
