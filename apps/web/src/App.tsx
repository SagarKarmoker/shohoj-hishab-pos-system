import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useSearchParams, Outlet } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { EmailVerificationPage } from './pages/EmailVerificationPage'
import { PasswordResetPage } from './pages/PasswordResetPage'
import { DashboardPage } from './pages/DashboardPage'
import { POSPage } from './pages/POSPage'
import { StockPage } from './pages/StockPage'
import { CreditPage } from './pages/CreditPage'
import { AccountsPage } from './pages/AccountsPage'
import { SettingsPage } from './pages/SettingsPage'
import { AdminPage } from './pages/AdminPage'
import { TermsPage } from './pages/TermsPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { SettingsProvider } from './contexts/SettingsContext'
import { ShopProvider } from './contexts/ShopContext'

function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved === 'dark'
  })

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  return [isDark, () => setIsDark((v) => !v)] as const
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, needsApproval, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }
  if (needsApproval) return <Navigate to="/auth" state={{ from: location }} replace />
  if (!isAuthenticated) return <Navigate to="/auth" state={{ from: location }} replace />
  return <>{children}</>
}

/** ADMIN/SUPER_ADMIN don't need a shop — send them to Admin Panel */
function DashboardRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
    return <Navigate to="/admin" replace />
  }
  return <>{children}</>
}

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, needsApproval, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }
  if (isAuthenticated && !needsApproval) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function VerifyEmailRoute() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''
  return <EmailVerificationPage token={token} onVerificationSuccess={() => navigate('/dashboard')} onBackToLogin={() => navigate('/auth')} />
}

function ResetPasswordRoute() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''
  return <PasswordResetPage token={token} onResetSuccess={() => navigate('/auth')} onBackToLogin={() => navigate('/auth')} />
}

function LandingRoute() {
  const navigate = useNavigate()
  const [isDark, toggleTheme] = useTheme()
  const { isAuthenticated, needsApproval, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }
  if (isAuthenticated && !needsApproval) return <Navigate to="/dashboard" replace />

  return (
    <LandingPage
      isDark={isDark}
      onToggleTheme={toggleTheme}
      onNavigateToLogin={() => navigate('/auth')}
      onNavigateToDashboard={() => navigate('/dashboard')}
      onNavigateToTerms={() => navigate('/terms')}
      onNavigateToPrivacy={() => navigate('/privacy')}
      isAuthenticated={isAuthenticated}
    />
  )
}

function AppRoutes() {
  const navigate = useNavigate()
  const [isDark, toggleTheme] = useTheme()
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
    navigate('/')
  }

  return (
    <SettingsProvider>
      <Routes>
        <Route path="/" element={<LandingRoute />} />

        <Route path="/auth" element={<AuthRedirect><LoginPage onBackToHome={() => navigate('/')} onLoginSuccess={() => navigate('/dashboard')} /></AuthRedirect>} />
        <Route path="/auth/verify-email" element={<AuthRedirect><VerifyEmailRoute /></AuthRedirect>} />
        <Route path="/auth/reset-password" element={<AuthRedirect><ResetPasswordRoute /></AuthRedirect>} />

        <Route element={<ProtectedRoute><ShopProvider><Outlet /></ShopProvider></ProtectedRoute>}>
          <Route path="dashboard" element={<DashboardRoute><DashboardPage isDark={isDark} onToggleTheme={toggleTheme} onLogout={handleLogout} onNavigateToPOS={() => navigate('/dashboard/pos')} onNavigateToStock={() => navigate('/dashboard/stock')} onNavigateToCredit={() => navigate('/dashboard/credit')} onNavigateToAccounts={() => navigate('/dashboard/accounts')} onNavigateToSettings={() => navigate('/settings')} onNavigateToAdmin={() => navigate('/admin')} /></DashboardRoute>} />
          <Route path="dashboard/pos" element={<POSPage isDark={isDark} onToggleTheme={toggleTheme} onBackToDashboard={() => navigate('/dashboard')} />} />
          <Route path="dashboard/stock" element={<StockPage isDark={isDark} onToggleTheme={toggleTheme} onBackToDashboard={() => navigate('/dashboard')} />} />
          <Route path="dashboard/credit" element={<CreditPage isDark={isDark} onToggleTheme={toggleTheme} onBackToDashboard={() => navigate('/dashboard')} />} />
          <Route path="dashboard/accounts" element={<AccountsPage isDark={isDark} onToggleTheme={toggleTheme} onBackToDashboard={() => navigate('/dashboard')} />} />
          <Route path="settings" element={<SettingsPage isDark={isDark} onToggleTheme={toggleTheme} onBackToDashboard={() => navigate('/dashboard')} />} />
        </Route>
        <Route path="/admin" element={<ProtectedRoute><AdminPage isDark={isDark} onToggleTheme={toggleTheme} onLogout={handleLogout} /></ProtectedRoute>} />

        <Route path="/terms" element={<TermsPage isDark={isDark} onToggleTheme={toggleTheme} onBackToLanding={() => navigate('/')} />} />
        <Route path="/privacy" element={<PrivacyPage isDark={isDark} onToggleTheme={toggleTheme} onBackToLanding={() => navigate('/')} />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SettingsProvider>
  )
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
