import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ReminderScheduler } from './components/ReminderScheduler'
import { HomePage } from './pages/HomePage'
import { MePage } from './pages/MePage'
import { MockPage } from './pages/MockPage'
import { PracticePage } from './pages/PracticePage'
import { QuizPage } from './pages/QuizPage'
import { ShenlunDetailPage } from './pages/ShenlunDetailPage'
import { ShenlunPage } from './pages/ShenlunPage'
import { WrongBookPage } from './pages/WrongBookPage'

export default function App() {
  return (
    <HashRouter>
      <ReminderScheduler />
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="practice" element={<PracticePage />} />
          <Route path="practice/quiz" element={<QuizPage />} />
          <Route path="practice/mock" element={<MockPage />} />
          <Route path="wrong" element={<WrongBookPage />} />
          <Route path="shenlun" element={<ShenlunPage />} />
          <Route path="shenlun/:id" element={<ShenlunDetailPage />} />
          <Route path="me" element={<MePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
