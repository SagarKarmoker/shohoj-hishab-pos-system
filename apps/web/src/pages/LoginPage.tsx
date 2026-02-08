import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../components/Icon';

interface LoginPageProps {
  onBackToHome: () => void;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export function LoginPage({ onBackToHome }: LoginPageProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = t('login.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('login.errors.emailInvalid');
    }

    if (!password) {
      newErrors.password = t('login.errors.passwordRequired');
    } else if (password.length < 6) {
      newErrors.password = t('login.errors.passwordMin');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful login
      console.log('Login successful:', { email, rememberMe });
      // TODO: Implement actual authentication
      alert('Login successful! (Demo)');
    } catch (error) {
      setErrors({ general: t('login.errors.invalidCredentials') });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex">
      {/* Left Side - Image/Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <button 
              onClick={onBackToHome}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <Icon name="arrow_back" />
              <span>{t('footer.home')}</span>
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Icon name="storefront" className="text-white text-3xl" />
            </div>
            <h2 className="text-4xl font-bold">{t('nav.brand')}</h2>
            <p className="text-white/80 text-lg max-w-md">
              {t('footer.description')}
            </p>
            
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-white/30 border-2 border-primary"></div>
                <div className="w-10 h-10 rounded-full bg-white/40 border-2 border-primary"></div>
                <div className="w-10 h-10 rounded-full bg-white/50 border-2 border-primary"></div>
              </div>
              <p className="text-white/80 text-sm">10,000+ {t('stats.trusted')}</p>
            </div>
          </div>
          
          <div className="text-white/60 text-sm">
            © {new Date().getFullYear()} {t('nav.brand')}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12">
        {/* Mobile Back Button */}
        <div className="lg:hidden absolute top-6 left-6">
          <button 
            onClick={onBackToHome}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors cursor-pointer"
          >
            <Icon name="arrow_back" />
            <span>{t('footer.home')}</span>
          </button>
        </div>

        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="lg:hidden mb-6">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/30">
                <Icon name="storefront" className="text-white text-3xl" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {t('login.title')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              {t('login.subtitle')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm">
                {errors.general}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('login.emailLabel')}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon name="email" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('login.emailPlaceholder')}
                  className={`w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 ${
                    errors.email ? 'border-error focus:ring-error focus:border-error' : 'border-slate-200 dark:border-slate-700'
                  }`}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-error text-sm">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('login.passwordLabel')}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon name="lock" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.passwordPlaceholder')}
                  className={`w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 ${
                    errors.password ? 'border-error focus:ring-error focus:border-error' : 'border-slate-200 dark:border-slate-700'
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                >
                  <Icon name={showPassword ? 'visibility_off' : 'visibility'} />
                </button>
              </div>
              {errors.password && (
                <p className="text-error text-sm">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                  disabled={isLoading}
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {t('login.rememberMe')}
                </span>
              </label>
              <button
                type="button"
                className="text-sm text-primary hover:text-primary-hover font-medium cursor-pointer"
                disabled={isLoading}
              >
                {t('login.forgotPassword')}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-orange-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  {t('login.loggingIn')}
                </>
              ) : (
                <>
                  <Icon name="login" />
                  {t('login.loginButton')}
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background-light dark:bg-background-dark text-slate-500">
                {t('login.orContinueWith')}
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Google</span>
            </button>
            <button
              type="button"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Facebook</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-slate-600 dark:text-slate-400">
            {t('login.noAccount')}{' '}
            <button
              type="button"
              className="text-primary hover:text-primary-hover font-semibold cursor-pointer"
              disabled={isLoading}
            >
              {t('login.signUp')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}