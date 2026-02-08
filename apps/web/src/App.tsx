import { useState, useEffect } from 'react'
import { LanguageProvider } from './contexts/LanguageContext'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'

type Page = 'landing' | 'login'

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

  return (
    <LanguageProvider>
      {currentPage === 'landing' ? (
        <LandingPage 
          isDark={isDark} 
          onToggleTheme={() => setIsDark(!isDark)} 
          onNavigateToLogin={navigateToLogin}
        />
      ) : (
        <LoginPage onBackToHome={navigateToLanding} />
      )}
    </LanguageProvider>
  )
}

export default App
