#!/usr/bin/env node
/**
 * 将 data/import/*.json 题包合并到 src/data/bank/packs/
 * 用法: npm run import:bank
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir = dirname(fileURLToPath(import.meta.url))
const importDir = join(__dir, '../data/import')
const packDir = join(__dir, '../src/data/bank/packs')

mkdirSync(importDir, { recursive: true })
mkdirSync(packDir, { recursive: true })

if (!existsSync(importDir)) {
  console.log('无 import 目录')
  process.exit(0)
}

const files = readdirSync(importDir).filter((f) => f.endsWith('.json'))
if (!files.length) {
  console.log('data/import/ 下暂无 JSON 题包。请参考 data/import/example-pack.json 格式添加。')
  process.exit(0)
}

let total = 0
for (const file of files) {
  const raw = readFileSync(join(importDir, file), 'utf8')
  const pack = JSON.parse(raw)
  if (!pack.meta?.id || !Array.isArray(pack.questions)) {
    console.warn(`跳过无效题包: ${file}`)
    continue
  }
  const out = join(packDir, `${pack.meta.id}.json`)
  writeFileSync(out, JSON.stringify(pack, null, 2), 'utf8')
  total += pack.questions.length
  console.log(`✓ 导入 ${file} → ${pack.questions.length} 题`)
}

console.log(`\n共导入 ${total} 题到 ${packDir}`)
