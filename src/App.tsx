import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components'
import {
  LoginPage,
  InputOrderPage,
  CustomerListPage,
  CustomerDetailPage,
  DashboardPage,
  FollowUpPage,
  SettingsPage,
  ExportPage,
} from '@/pages'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Layout><InputOrderPage /></Layout>} />
        <Route path="/customers" element={<Layout><CustomerListPage /></Layout>} />
        <Route path="/customers/:id" element={<Layout><CustomerDetailPage /></Layout>} />
        <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
        <Route path="/follow-up" element={<Layout><FollowUpPage /></Layout>} />
        <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
        <Route path="/export" element={<Layout><ExportPage /></Layout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
