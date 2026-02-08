import { Icon } from './Icon'

interface NavbarProps {
  isDark: boolean
  onToggleTheme: () => void
}

export function Navbar({ isDark: _isDark, onToggleTheme }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Icon name="restaurant" className="text-white text-xl" />
          </div>
          <span className="font-bold text-xl tracking-tight">
            Shohoj<span className="text-primary">Hishab</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Restaurant POS v1.0
          </span>
          <button 
            onClick={onToggleTheme}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="block dark:hidden">
              <Icon name="dark_mode" />
            </span>
            <span className="hidden dark:block">
              <Icon name="light_mode" />
            </span>
          </button>
        </div>
      </div>
    </nav>
  )
}