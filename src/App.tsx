import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components'
import {
  LandingPage,
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
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/app" element={<Layout><InputOrderPage /></Layout>} />
        <Route path="/app/customers" element={<Layout><CustomerListPage /></Layout>} />
        <Route path="/app/customers/:id" element={<Layout><CustomerDetailPage /></Layout>} />
        <Route path="/app/dashboard" element={<Layout><DashboardPage /></Layout>} />
        <Route path="/app/follow-up" element={<Layout><FollowUpPage /></Layout>} />
        <Route path="/app/settings" element={<Layout><SettingsPage /></Layout>} />
        <Route path="/app/export" element={<Layout><ExportPage /></Layout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
