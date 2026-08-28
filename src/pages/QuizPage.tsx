import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { QuestionFigure } from '../components/figures/PatternFigures'
import {
  CATEGORIES,
  QUESTIONS,
  getQuestionsByCategory,
  type CategoryId,
  type Question,
} from '../data/questions'
import { addStudyMinutes, recordAnswer, setMockBestScore, useProgress } from '../lib/progress'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQueue(params: URLSearchParams, wrongIds: string[]): Question[] {
  const mode = params.get('mode')
  const category = params.get('category') as CategoryId | 'all' | null
  const wrongOnly = params.get('wrong') === '1'

  if (wrongOnly) {
    return QUESTIONS.filter((q) => wrongIds.includes(q.id))
  }

  if (mode === 'daily') {
    return shuffle(QUESTIONS).slice(0, Math.min(10, QUESTIONS.length))
  }

  if (mode === 'mock') {
    return shuffle(QUESTIONS).slice(0, Math.min(15, QUESTIONS.length))
  }

  if (category && category !== 'all' && category in CATEGORIES) {
    return getQuestionsByCategory(category)
  }

  return shuffle(QUESTIONS).slice(0, 10)
}

export function QuizPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const progress = useProgress()
  const isMock = params.get('mode') === 'mock'
  const wrongOnly = params.get('wrong') === '1'

  const queue = useMemo(
    () => buildQueue(params, progress.wrongBook.map((w) => w.questionId)),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- queue fixed per session entry
    [params.toString()],
  )

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const [startedAt] = useState(() => Date.now())

  if (!queue.length) {
    return (
      <div className="page">
        <h1 className="page-title">{wrongOnly ? '错题复习' : '练题'}</h1>
        <div className="empty">
          <p>{wrongOnly ? '错题本是空的，继续保持！' : '暂无题目'}</p>
          <Link className="btn btn-solid" to={wrongOnly ? '/practice' : '/'}>
            返回
          </Link>
        </div>
      </div>
    )
  }

  const q = queue[index]
  const cat = CATEGORIES[q.category]
  const pct = Math.round(((index + (revealed ? 1 : 0)) / queue.length) * 100)

  function onSelect(i: number) {
    if (revealed) return
    setSelected(i)
  }

  function onConfirm() {
    if (selected === null || revealed) return
    const ok = selected === q.answer
    recordAnswer(q.id, ok)
    if (ok) setCorrectCount((c) => c + 1)
    setRevealed(true)
  }

  function onNext() {
    if (index + 1 >= queue.length) {
      const minutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000))
      addStudyMinutes(minutes)
      if (isMock) {
        const score = Math.round((correctCount / queue.length) * 100)
        setMockBestScore(score)
      }
      setFinished(true)
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
    setRevealed(false)
  }

  if (finished) {
    const score = Math.round((correctCount / queue.length) * 100)
    return (
      <div className="page">
        <div className="result-hero">
          <div className="muted" style={{ color: 'rgba(255,255,255,.75)' }}>
            {isMock ? '迷你模考完成' : '本轮练习完成'}
          </div>
          <div className="score">{score}</div>
          <div>
            答对 {correctCount}/{queue.length} · 用时约{' '}
            {Math.max(1, Math.round((Date.now() - startedAt) / 60000))} 分钟
          </div>
        </div>
        <div className="quiz-actions">
          <button className="btn btn-outline" type="button" onClick={() => navigate(-1)}>
            返回
          </button>
          <Link className="btn btn-solid" to="/wrong">
            查看错题
          </Link>
        </div>
        <div className="quiz-actions">
          <Link className="btn btn-primary" to="/practice/quiz?mode=daily" style={{ flex: 1 }}>
            再来一组
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="quiz-top">
        <div>
          <div className="tag">{cat.short}</div>
          <span className="muted">
            {index + 1}/{queue.length}
            {isMock ? ' · 模考' : ''}
          </span>
        </div>
        <button className="btn btn-outline" type="button" onClick={() => navigate(-1)}>
          退出
        </button>
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <p className="stem">{q.stem}</p>

      {q.figure && (
        <div className="stem-figure">
          <QuestionFigure id={q.figure} size="lg" />
        </div>
      )}

      <div className={`options${q.optionFigures ? ' options-figure' : ''}`}>
        {q.options.map((opt, i) => {
          let cls = 'option'
          if (revealed) {
            if (i === q.answer) cls += ' correct'
            else if (i === selected) cls += ' wrong'
          } else if (selected === i) {
            cls += ' selected'
          }
          return (
            <button key={opt + i} type="button" className={cls} onClick={() => onSelect(i)}>
              {q.optionFigures?.[i] && (
                <QuestionFigure id={q.optionFigures[i]} size="sm" />
              )}
              <span className="option-label">{opt}</span>
            </button>
          )
        })}
      </div>

      {revealed && (
        <div className="explain-box">
          <h3>{selected === q.answer ? '回答正确' : '再看一眼解析'}</h3>
          <p>{q.explanation}</p>
        </div>
      )}

      <div className="quiz-actions">
        {!revealed ? (
          <button
            className="btn btn-solid"
            type="button"
            disabled={selected === null}
            onClick={onConfirm}
            style={{ opacity: selected === null ? 0.5 : 1 }}
          >
            确认答案
          </button>
        ) : (
          <button className="btn btn-primary" type="button" onClick={onNext}>
            {index + 1 >= queue.length ? '查看成绩' : '下一题'}
          </button>
        )}
      </div>
    </div>
  )
}
