import { useState, useEffect } from 'react'
import { LanguageProvider } from './contexts/LanguageContext'
import { LandingPage } from './pages/LandingPage'

function App() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  return (
    <LanguageProvider>
      <LandingPage isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />
    </LanguageProvider>
  )
}

export default App