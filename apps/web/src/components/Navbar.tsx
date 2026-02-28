import { useTranslation } from 'react-i18next';
import { Icon } from './Icon';
import { useLanguage } from '../contexts/LanguageContext';
import { useSmoothScroll } from '../hooks/useSmoothScroll';

interface NavbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onNavigateToLogin: () => void;
}

export function Navbar({ isDark, onToggleTheme, onNavigateToLogin }: NavbarProps) {
  const { t } = useTranslation();
  const { currentLanguage, toggleLanguage } = useLanguage();
  const { handleNavClick } = useSmoothScroll();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Icon name="storefront" className="text-white text-2xl" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-slate-800 dark:text-white">
            {t('nav.brand')}
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 font-medium">
          <a 
            href="#features" 
            onClick={(e) => handleNavClick(e, 'features')}
            className="text-slate-600 hover:text-primary dark:text-slate-300 transition-colors cursor-pointer"
          >
            {t('nav.features')}
          </a>
          <a 
            href="#pricing" 
            onClick={(e) => handleNavClick(e, 'pricing')}
            className="text-slate-600 hover:text-primary dark:text-slate-300 transition-colors cursor-pointer"
          >
            {t('nav.pricing')}
          </a>
          <a 
            href="#contact" 
            onClick={(e) => handleNavClick(e, 'contact')}
            className="text-slate-600 hover:text-primary dark:text-slate-300 transition-colors cursor-pointer"
          >
            {t('nav.contact')}
          </a>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          {/* Language Switcher - Hidden on mobile */}
          <button
            onClick={toggleLanguage}
            className="hidden sm:flex px-2 py-1.5 md:px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors items-center gap-1 md:gap-2 cursor-pointer"
          >
            <span className="text-base md:text-lg">{currentLanguage === 'bn' ? '🇧🇩' : '🇺🇸'}</span>
            <span>{currentLanguage === 'bn' ? t('common.bangla') : t('common.english')}</span>
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={onToggleTheme}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <Icon name="light_mode" className="text-slate-400" />
            ) : (
              <Icon name="dark_mode" className="text-slate-500" />
            )}
          </button>
          
          {/* Login Button */}
          <button 
            onClick={onNavigateToLogin}
            className="px-4 py-2 md:px-6 md:py-2.5 bg-primary text-white text-sm md:text-base font-semibold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 active:scale-95 cursor-pointer"
          >
            {t('nav.login')}
          </button>
        </div>
      </div>
    </nav>
  );
}
