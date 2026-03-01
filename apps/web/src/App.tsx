import { useState, useEffect } from 'react'
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

type Page = 'landing' | 'login' | 'verify-email' | 'reset-password' | 'dashboard' | 'pos' | 'stock' | 'credit' | 'accounts' | 'settings' | 'admin' | 'terms' | 'privacy'

function AppContent() {
  const { logout, needsApproval, isAuthenticated } = useAuth()
  
  // Check for saved theme preference or default to light
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) {
      return saved === 'dark'
    }
    return false // Default to light mode
  })

  // Simple page routing with URL params support
  const [currentPage, setCurrentPage] = useState<Page>('landing')
  const [pageParams, setPageParams] = useState<Record<string, string>>({})

  // Handle URL parameters on mount and when URL changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const page = params.get('page') as Page
    const token = params.get('token')
    
    if (page === 'verify-email' && token) {
      setCurrentPage('verify-email')
      setPageParams({ token })
    } else if (page === 'reset-password' && token) {
      setCurrentPage('reset-password')
      setPageParams({ token })
    }
  }, [])

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

  const navigateToLogin = () => {
    window.history.pushState({}, '', '/')
    setCurrentPage('login')
    setPageParams({})
    window.scrollTo(0, 0)
  }

  const navigateToLanding = () => {
    window.history.pushState({}, '', '/')
    setCurrentPage('landing')
    setPageParams({})
    window.scrollTo(0, 0)
  }

  const navigateToDashboard = () => {
    // Check if user needs approval before accessing dashboard
    const needsApproval = localStorage.getItem('needs_approval') === 'true';
    if (needsApproval) {
      // Stay on login page with approval message
      setCurrentPage('login');
      return;
    }
    window.history.pushState({}, '', '/')
    setCurrentPage('dashboard')
    setPageParams({})
    window.scrollTo(0, 0)
  }

  const navigateToPOS = () => {
    setCurrentPage('pos')
    window.scrollTo(0, 0)
  }

  const navigateToStock = () => {
    setCurrentPage('stock')
    window.scrollTo(0, 0)
  }

  const navigateToCredit = () => {
    setCurrentPage('credit')
    window.scrollTo(0, 0)
  }

  const navigateToAccounts = () => {
    setCurrentPage('accounts')
    window.scrollTo(0, 0)
  }

  const navigateToSettings = () => {
    setCurrentPage('settings')
    window.scrollTo(0, 0)
  }

  const navigateToAdmin = () => {
    setCurrentPage('admin')
    window.scrollTo(0, 0)
  }

  const navigateToTerms = () => {
    setCurrentPage('terms')
    window.scrollTo(0, 0)
  }

  const navigateToPrivacy = () => {
    setCurrentPage('privacy')
    window.scrollTo(0, 0)
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
    setCurrentPage('landing')
    window.scrollTo(0, 0)
  }

  return (
    <SettingsProvider>
      {currentPage === 'landing' && (
        <LandingPage
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
          onNavigateToLogin={navigateToLogin}
          onNavigateToTerms={navigateToTerms}
          onNavigateToPrivacy={navigateToPrivacy}
        />
      )}
      {currentPage === 'login' && (
        <LoginPage
          onBackToHome={navigateToLanding}
          onLoginSuccess={navigateToDashboard}
        />
      )}
      {currentPage === 'verify-email' && (
        <EmailVerificationPage
          token={pageParams.token || ''}
          onVerificationSuccess={navigateToDashboard}
          onBackToLogin={navigateToLogin}
        />
      )}
      {currentPage === 'reset-password' && (
        <PasswordResetPage
          token={pageParams.token || ''}
          onResetSuccess={navigateToLogin}
          onBackToLogin={navigateToLogin}
        />
      )}
      {currentPage === 'dashboard' && (
        <DashboardPage
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
          onLogout={handleLogout}
          onNavigateToPOS={navigateToPOS}
          onNavigateToStock={navigateToStock}
          onNavigateToCredit={navigateToCredit}
          onNavigateToAccounts={navigateToAccounts}
          onNavigateToSettings={navigateToSettings}
          onNavigateToAdmin={navigateToAdmin}
        />
      )}
      {currentPage === 'pos' && (
        <POSPage
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
          onBackToDashboard={navigateToDashboard}
        />
      )}
      {currentPage === 'stock' && (
        <StockPage
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
          onBackToDashboard={navigateToDashboard}
        />
      )}
      {currentPage === 'credit' && (
        <CreditPage
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
          onBackToDashboard={navigateToDashboard}
        />
      )}
      {currentPage === 'accounts' && (
        <AccountsPage
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
          onBackToDashboard={navigateToDashboard}
        />
      )}
      {currentPage === 'settings' && (
        <SettingsPage
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
          onBackToDashboard={navigateToDashboard}
        />
      )}
      {currentPage === 'admin' && (
        <AdminPage
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
          onBackToDashboard={navigateToDashboard}
          onLogout={handleLogout}
        />
      )}
      {currentPage === 'terms' && (
        <TermsPage
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
          onBackToLanding={navigateToLanding}
        />
      )}
      {currentPage === 'privacy' && (
        <PrivacyPage
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
          onBackToLanding={navigateToLanding}
        />
      )}
    </SettingsProvider>
  )
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
