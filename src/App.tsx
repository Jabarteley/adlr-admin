import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { UsersPage } from './pages/UsersPage'
import { UserDetailPage } from './pages/UserDetailPage'
import { NetworksPage } from './pages/NetworksPage'
import { NetworkDetailPage } from './pages/NetworkDetailPage'
import { AlertsPage } from './pages/AlertsPage'
import { ConsentPage } from './pages/ConsentPage'
import { AuditLogPage } from './pages/AuditLogPage'
import { SystemHealthPage } from './pages/SystemHealthPage'
import { AdminsPage } from './pages/AdminsPage'
import { WaitlistPage } from './pages/WaitlistPage'
import { NewsletterPage } from './pages/NewsletterPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Layout>
                  <UsersPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:userId"
            element={
              <ProtectedRoute>
                <Layout>
                  <UserDetailPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/networks"
            element={
              <ProtectedRoute>
                <Layout>
                  <NetworksPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/networks/:networkId"
            element={
              <ProtectedRoute>
                <Layout>
                  <NetworkDetailPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/waitlist"
            element={
              <ProtectedRoute>
                <Layout>
                  <WaitlistPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/newsletter"
            element={
              <ProtectedRoute>
                <Layout>
                  <NewsletterPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedRoute>
                <Layout>
                  <AlertsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/consent"
            element={
              <ProtectedRoute>
                <Layout>
                  <ConsentPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit-log"
            element={
              <ProtectedRoute>
                <Layout>
                  <AuditLogPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/system-health"
            element={
              <ProtectedRoute>
                <Layout>
                  <SystemHealthPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admins"
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
