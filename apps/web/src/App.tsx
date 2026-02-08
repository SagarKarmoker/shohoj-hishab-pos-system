import { useState, useEffect } from 'react'
import { LanguageProvider } from './contexts/LanguageContext'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { POSPage } from './pages/POSPage'
import { StockPage } from './pages/StockPage'
import { CreditPage } from './pages/CreditPage'
import { AccountsPage } from './pages/AccountsPage'
import { SettingsPage } from './pages/SettingsPage'
import { SettingsProvider } from './contexts/SettingsContext'

type Page = 'landing' | 'login' | 'dashboard' | 'pos' | 'stock' | 'credit' | 'accounts' | 'settings'

function App() {
  // Check for saved theme preference or default to light
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) {
      return saved === 'dark'
    }
    return false // Default to light mode
  })

  // Simple page routing
  const [currentPage, setCurrentPage] = useState<Page>('landing')

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
    setCurrentPage('login')
    window.scrollTo(0, 0)
  }

  const navigateToLanding = () => {
    setCurrentPage('landing')
    window.scrollTo(0, 0)
  }

  const navigateToDashboard = () => {
    setCurrentPage('dashboard')
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

  const handleLogout = () => {
    setCurrentPage('landing')
    window.scrollTo(0, 0)
  }

  return (
    <LanguageProvider>
      <SettingsProvider>
        {currentPage === 'landing' && (
          <LandingPage
            isDark={isDark}
            onToggleTheme={() => setIsDark(!isDark)}
            onNavigateToLogin={navigateToLogin}
          />
        )}
        {currentPage === 'login' && (
          <LoginPage
            onBackToHome={navigateToLanding}
            onLoginSuccess={navigateToDashboard}
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
      </SettingsProvider>
    </LanguageProvider>
  )
}

export default App
