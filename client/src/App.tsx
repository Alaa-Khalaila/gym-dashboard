import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/AppShell'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import MembersPage from './pages/MembersPage'
import AddMemberPage from './pages/AddMemberPage'
import MemberProfilePage from './pages/MemberProfilePage'
import EditMemberPage from './pages/EditMemberPage'
import NewSubscriptionPage from './pages/NewSubscriptionPage'
import SubscriptionsPage from './pages/SubscriptionsPage'
import RevenuePage from './pages/RevenuePage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Protected: both roles */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/members" element={<MembersPage />} />
                <Route path="/members/new" element={<AddMemberPage />} />
                <Route path="/members/:id" element={<MemberProfilePage />} />
                <Route path="/members/:id/edit" element={<EditMemberPage />} />
                <Route path="/subscriptions" element={<SubscriptionsPage />} />
                <Route path="/subscriptions/new" element={<NewSubscriptionPage />} />

                {/* Protected: super admin only */}
                <Route element={<ProtectedRoute requiredRole="super_admin" />}>
                  <Route path="/revenue" element={<RevenuePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
