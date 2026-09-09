import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { HomePage } from './pages/HomePage'
import { LedgerPage } from './pages/LedgerPage'
import { LinesPage } from './pages/LinesPage'
import { ProducePage } from './pages/ProducePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="produce" element={<ProducePage />} />
          <Route path="lines" element={<LinesPage />} />
          <Route path="ledger" element={<LedgerPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
