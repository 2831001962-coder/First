import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { QuestionFigure } from '../components/figures/PatternFigures'
import {
  getQuestionsBySubject,
  getQuestionsByCategory,
  SUBJECTS,
  XINGCE_CATEGORIES,
  ZHUANYE_CATEGORIES,
} from '../data/bank/registry'
import type { CategoryId, SubjectId } from '../data/bank/types'
import { addStudyMinutes, recordAnswer, setMockBestScore, useProgress } from '../lib/progress'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQueue(
  params: URLSearchParams,
  wrongIds: string[],
  subject: SubjectId,
) {
  const mode = params.get('mode')
  const category = params.get('category') as CategoryId | null
  const wrongOnly = params.get('wrong') === '1'
  const pool = getQuestionsBySubject(subject)

  if (wrongOnly) {
    return pool.filter((q) => wrongIds.includes(q.id))
  }

  if (mode === 'daily') {
    return shuffle(pool).slice(0, Math.min(10, pool.length))
  }

  if (mode === 'mock') {
    return shuffle(pool).slice(0, Math.min(15, pool.length))
  }

  if (category) {
    return getQuestionsByCategory(subject, category)
  }

  return shuffle(pool).slice(0, 10)
}

function categoryLabel(subject: SubjectId, category: CategoryId) {
  if (subject === 'xingce' && category in XINGCE_CATEGORIES) {
    return XINGCE_CATEGORIES[category as keyof typeof XINGCE_CATEGORIES]
  }
  if (subject === 'zhuanye' && category in ZHUANYE_CATEGORIES) {
    return ZHUANYE_CATEGORIES[category as keyof typeof ZHUANYE_CATEGORIES]
  }
  return { short: '题', name: '练习', color: 'var(--sea)' }
}

type QuizPageProps = {
  subject?: SubjectId
}

export function QuizPage({ subject: subjectProp = 'xingce' }: QuizPageProps) {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const progress = useProgress()
  const subject = (params.get('subject') as SubjectId) || subjectProp
  const isMock = params.get('mode') === 'mock'
  const wrongOnly = params.get('wrong') === '1'
  const backPath = subject === 'zhuanye' ? '/pro' : '/practice'

  const queue = useMemo(
    () => buildQueue(params, progress.wrongBook.map((w) => w.questionId), subject),
    [params.toString(), subject, progress.wrongBook.length],
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
        <h1 className="page-title">{wrongOnly ? '错题复习' : SUBJECTS[subject].short + '练题'}</h1>
        <div className="empty">
          <p>{wrongOnly ? '错题本是空的，继续保持！' : '该模块暂无题目'}</p>
          <Link className="btn btn-solid" to={backPath}>
            返回
          </Link>
        </div>
      </div>
    )
  }

  const q = queue[index]
  const cat = categoryLabel(subject, q.category)
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

  const dailyLink =
    subject === 'zhuanye'
      ? '/pro/quiz?mode=daily'
      : '/practice/quiz?mode=daily'

  if (finished) {
    const score = Math.round((correctCount / queue.length) * 100)
    return (
      <div className="page">
        <div className="result-hero">
          <div className="muted" style={{ color: 'rgba(255,255,255,.75)' }}>
            {isMock ? '迷你模考完成' : `${SUBJECTS[subject].short}练习完成`}
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
          <Link className="btn btn-primary" to={dailyLink} style={{ flex: 1 }}>
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
