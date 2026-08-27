import { Link } from 'react-router-dom'
import { CATEGORIES, getQuestionById } from '../data/questions'
import { removeFromWrongBook, useProgress } from '../lib/progress'

export function WrongBookPage() {
  const progress = useProgress()
  const items = [...progress.wrongBook].sort((a, b) => b.lastWrongAt - a.lastWrongAt)

  return (
    <div className="page">
      <h1 className="page-title">错题本</h1>
      <p className="page-sub">错一次记一次，对一次消一条</p>

      {items.length > 0 && (
        <Link className="btn btn-solid" to="/practice/quiz?wrong=1" style={{ marginBottom: 16 }}>
          开始复习全部错题
        </Link>
      )}

      {!items.length ? (
        <div className="empty">
          <p>暂无错题。继续刷题，岸途会自动收录。</p>
          <Link className="btn btn-outline" to="/practice">
            去刷题
          </Link>
        </div>
      ) : (
        items.map((item) => {
          const q = getQuestionById(item.questionId)
          if (!q) return null
          const cat = CATEGORIES[q.category]
          return (
            <div key={item.questionId} className="list-card">
              <div className="eyebrow" style={{ color: cat.color }}>
                {cat.short} · 错 {item.wrongCount} 次
              </div>
              <h3 style={{ fontWeight: 500, fontSize: '0.95rem', lineHeight: 1.55 }}>
                {q.stem.slice(0, 72)}
                {q.stem.length > 72 ? '…' : ''}
              </h3>
              <p style={{ marginTop: 8 }}>正确答案：{q.options[q.answer]}</p>
              <div className="quiz-actions" style={{ marginTop: 12 }}>
                <Link
                  className="btn btn-outline"
                  to={`/practice/quiz?wrong=1`}
                  style={{ flex: 1, fontSize: '0.85rem' }}
                >
                  去复习
                </Link>
                <button
                  className="btn btn-solid"
                  type="button"
                  style={{ flex: 1, fontSize: '0.85rem' }}
                  onClick={() => removeFromWrongBook(item.questionId)}
                >
                  已掌握
                </button>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
