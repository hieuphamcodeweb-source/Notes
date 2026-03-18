import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import NotesPage from '@/pages/notes/index'

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/notes" />} />
        <Route path="/notes" element={<NotesPage />} />
      </Routes>
    </BrowserRouter>
  )
}