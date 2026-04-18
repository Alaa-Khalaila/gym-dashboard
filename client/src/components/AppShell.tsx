import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Dumbbell,
  Menu,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import LanguageToggle from './ui/LanguageToggle'

interface NavItem {
  key: string
  to: string
  icon: React.ReactNode
  superAdminOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { key: 'nav.dashboard', to: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { key: 'nav.members', to: '/members', icon: <Users className="w-5 h-5" /> },
  { key: 'nav.subscriptions', to: '/subscriptions', icon: <CreditCard className="w-5 h-5" /> },
  { key: 'nav.revenue', to: '/revenue', icon: <BarChart3 className="w-5 h-5" />, superAdminOnly: true },
  { key: 'nav.settings', to: '/settings', icon: <Settings className="w-5 h-5" />, superAdminOnly: true },
]

export default function AppShell() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const visibleNav = NAV_ITEMS.filter(
    (item) => !item.superAdminOnly || user?.role === 'super_admin'
  )

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
      isActive
        ? 'bg-indigo-50 text-indigo-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    ].join(' ')

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-gray-200">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600">
          <Dumbbell className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-gray-900 text-base">GymDash</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {visibleNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={navLinkClass}
            onClick={() => setSidebarOpen(false)}
          >
            {item.icon}
            {t(item.key)}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-gray-200 space-y-1">
        <div className="px-3 py-2 text-xs text-gray-500 truncate">{user?.name}</div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {t('nav.logout')}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-white border-e border-gray-200">
        {sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-50 flex flex-col w-60 bg-white border-e border-gray-200">
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-gray-900 text-sm">GymDash</span>
          </div>
          <LanguageToggle />
        </header>

        {/* Desktop top bar */}
        <header className="hidden lg:flex items-center justify-end px-6 py-3 bg-white border-b border-gray-200">
          <LanguageToggle />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
