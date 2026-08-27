import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { SHENLUN_TOPICS } from '../data/shenlun'
import { addStudyMinutes } from '../lib/progress'

const DRAFT_KEY = 'antu-shenlun-drafts'

function loadDraft(id: string): string {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return ''
    return JSON.parse(raw)[id] ?? ''
  } catch {
    return ''
  }
}

function saveDraft(id: string, text: string) {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    const map = raw ? JSON.parse(raw) : {}
    map[id] = text
    localStorage.setItem(DRAFT_KEY, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

export function ShenlunDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const topic = SHENLUN_TOPICS.find((t) => t.id === id)
  const [showOutline, setShowOutline] = useState(false)
  const [draft, setDraft] = useState(() => (id ? loadDraft(id) : ''))
  const wordCount = useMemo(() => draft.replace(/\s/g, '').length, [draft])

  if (!topic) {
    return (
      <div className="page">
        <div className="empty">
          <p>题目不存在</p>
          <Link className="btn btn-solid" to="/shenlun">
            返回列表
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="quiz-top">
        <div>
          <span className="tag">{topic.type}</span>
          <span className="muted">{topic.year}</span>
        </div>
        <button className="btn btn-outline" type="button" onClick={() => navigate(-1)}>
          返回
        </button>
      </div>

      <h1 className="page-title" style={{ fontSize: '1.35rem' }}>
        {topic.title}
      </h1>

      <section className="section" style={{ marginTop: 12 }}>
        <div className="section-head">
          <h2>给定材料</h2>
        </div>
        <div className="list-card">
          <p style={{ color: 'var(--text)', lineHeight: 1.7 }}>{topic.material}</p>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>作答要求</h2>
        </div>
        <div className="list-card">
          <p style={{ color: 'var(--text)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
            {topic.demand}
          </p>
          <div className="keyword-row">
            {topic.keywords.map((k) => (
              <span key={k} className="keyword">
                {k}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>我的作答</h2>
          <p>{wordCount} 字</p>
        </div>
        <div className="field">
          <textarea
            rows={10}
            placeholder="在此起草答案或大作文提纲……"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value)
              saveDraft(topic.id, e.target.value)
            }}
          />
        </div>
        <div className="quiz-actions">
          <button
            className="btn btn-outline"
            type="button"
            onClick={() => setShowOutline((v) => !v)}
          >
            {showOutline ? '收起参考提纲' : '查看参考提纲'}
          </button>
          <button
            className="btn btn-solid"
            type="button"
            onClick={() => {
              addStudyMinutes(15)
              alert('已记录本次练笔时长，继续加油！')
            }}
          >
            完成练笔
          </button>
        </div>
      </section>

      {showOutline && (
        <section className="section">
          <div className="section-head">
            <h2>参考提纲</h2>
            <p>仅供对照，勿照抄</p>
          </div>
          <div className="list-card">
            <ol className="outline-list">
              {topic.outline.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
          </div>
        </section>
      )}
    </div>
  )
}
