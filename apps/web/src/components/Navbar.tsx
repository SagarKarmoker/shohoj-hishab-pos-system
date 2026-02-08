import { useTranslation } from 'react-i18next';
import { Icon } from './Icon';
import { useLanguage } from '../contexts/LanguageContext';

interface NavbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Navbar({ isDark, onToggleTheme }: NavbarProps) {
  const { t } = useTranslation();
  const { currentLanguage, toggleLanguage } = useLanguage();

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
          <a href="#features" className="text-slate-600 hover:text-primary dark:text-slate-300 transition-colors">
            {t('nav.features')}
          </a>
          <a href="#pricing" className="text-slate-600 hover:text-primary dark:text-slate-300 transition-colors">
            {t('nav.pricing')}
          </a>
          <a href="#contact" className="text-slate-600 hover:text-primary dark:text-slate-300 transition-colors">
            {t('nav.contact')}
          </a>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <span className="text-lg">{currentLanguage === 'bn' ? '🇧🇩' : '🇺🇸'}</span>
            <span>{currentLanguage === 'bn' ? t('common.bangla') : t('common.english')}</span>
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={onToggleTheme}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <Icon name="light_mode" className="text-slate-400" />
            ) : (
              <Icon name="dark_mode" className="text-slate-500" />
            )}
          </button>
          
          <a 
            href="#signup"
            className="hidden sm:inline-flex px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 active:scale-95"
          >
            {t('nav.login')}
          </a>
        </div>
      </div>
    </nav>
  );
}