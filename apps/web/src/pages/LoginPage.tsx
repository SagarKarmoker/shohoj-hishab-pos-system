import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';

interface LoginPageProps {
  onBackToHome: () => void;
  onLoginSuccess: () => void;
}

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'verification-sent';

export function LoginPage({ onBackToHome, onLoginSuccess }: LoginPageProps) {
  const { t } = useTranslation();
  const { signup, login, requestPasswordReset, resendVerification, email: contextEmail, setEmail: setContextEmail } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Reset form when mode changes
  useEffect(() => {
    setError(null);
    setSuccess(null);
    setPassword('');
    setConfirmPassword('');
  }, [mode]);

  const validateEmail = (): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError(t('login.errors.emailRequired') || 'Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setError(t('login.errors.emailInvalid') || 'Invalid email format');
      return false;
    }
    return true;
  };

  const validatePassword = (): boolean => {
    if (!password) {
      setError(t('login.errors.passwordRequired') || 'Password is required');
      return false;
    }
    
    if (mode === 'signup' || mode === 'forgot-password') {
      if (password.length < 8) {
        setError(t('login.errors.passwordTooShort') || 'Password must be at least 8 characters');
        return false;
      }
      
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      
      if (!hasUppercase || !hasLowercase || !hasNumber) {
        setError(t('login.errors.passwordRequirements') || 'Password must contain uppercase, lowercase, and number');
        return false;
      }
    }
    
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateEmail() || !validatePassword()) return;
    
    setIsLoading(true);
    try {
      await login(email, password);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || t('login.errors.loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateEmail() || !validatePassword()) return;
    
    if (password !== confirmPassword) {
      setError(t('login.errors.passwordMismatch') || 'Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    try {
      await signup(email, password, displayName || undefined);
      setContextEmail(email);
      setMode('verification-sent');
      setSuccess(t('login.success.verificationSent') || 'Verification email sent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message || t('login.errors.signupFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateEmail()) return;
    
    setIsLoading(true);
    try {
      await requestPasswordReset(email);
      setSuccess(t('login.success.resetLinkSent') || 'Password reset link sent! Check your email.');
    } catch (err: any) {
      setError(err.message || t('login.errors.resetFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await resendVerification(email || contextEmail);
      setSuccess(t('login.success.verificationResent') || 'Verification email resent!');
    } catch (err: any) {
      setError(err.message || t('login.errors.resendFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary opacity-20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-orange-300 opacity-20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-orange-400 opacity-20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>

      {/* Back button */}
      <button
        onClick={onBackToHome}
        className="fixed top-6 left-6 z-50 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105"
      >
        <Icon name="arrow_back" className="text-slate-700 dark:text-slate-300" />
      </button>

      {/* Main content */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20 transform hover:scale-105 transition-transform">
            <Icon name="storefront" className="text-white text-3xl" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">{t('nav.brand')}</h1>
          <p className="text-slate-600 dark:text-slate-400">
            {mode === 'login' && (t('login.subtitle') || 'Welcome back!')}
            {mode === 'signup' && (t('login.signupSubtitle') || 'Create your account')}
            {mode === 'forgot-password' && (t('login.resetSubtitle') || 'Reset your password')}
            {mode === 'verification-sent' && (t('login.verificationSubtitle') || 'Check your email')}
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-8 backdrop-blur-sm">
          {mode === 'verification-sent' ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="mark_email_read" className="text-green-600 dark:text-green-400 text-3xl" />
              </div>
              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-green-800 dark:text-green-200">
                  {success}
                </div>
              )}
              <p className="text-slate-600 dark:text-slate-400">
                {t('login.checkInbox') || 'We\'ve sent a verification link to your email. Please click the link to verify your account.'}
              </p>
              <button
                onClick={handleResendVerification}
                disabled={isLoading}
                className="text-primary hover:text-orange-600 font-medium cursor-pointer"
              >
                {t('login.resendVerification') || 'Resend verification email'}
              </button>
              <button
                onClick={() => setMode('login')}
                className="block w-full mt-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
              >
                {t('common.back') || 'Back to login'}
              </button>
            </div>
          ) : (
            <form onSubmit={mode === 'login' ? handleLogin : mode === 'signup' ? handleSignup : handleForgotPassword} className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
                  <Icon name="error" className="text-red-600 dark:text-red-400 text-xl flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-4 flex items-start gap-3">
                  <Icon name="check_circle" className="text-green-600 dark:text-green-400 text-xl flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-green-800 dark:text-green-200">{success}</span>
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('login.displayName') || 'Display Name'}
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder={t('login.displayNamePlaceholder') || 'Your name'}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('login.email') || 'Email'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder={t('login.emailPlaceholder') || 'your@email.com'}
                  required
                />
              </div>

              {mode !== 'forgot-password' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('login.password') || 'Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all pr-12"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                    >
                      <Icon name={showPassword ? 'visibility_off' : 'visibility'} />
                    </button>
                  </div>
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('login.confirmPassword') || 'Confirm Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all pr-12"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                    >
                      <Icon name={showConfirmPassword ? 'visibility_off' : 'visibility'} />
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Icon name="progress_activity" className="animate-spin" />
                    {t('common.loading') || 'Loading...'}
                  </span>
                ) : (
                  <>
                    {mode === 'login' && (t('login.loginButton') || 'Login')}
                    {mode === 'signup' && (t('login.signupButton') || 'Sign Up')}
                    {mode === 'forgot-password' && (t('login.resetButton') || 'Send Reset Link')}
                  </>
                )}
              </button>

              {/* Mode switchers */}
              <div className="text-center space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                {mode === 'login' && (
                  <>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {t('login.noAccount') || 'Don\'t have an account?'}{' '}
                      <button
                        type="button"
                        onClick={() => setMode('signup')}
                        className="text-primary hover:text-orange-600 font-medium cursor-pointer"
                      >
                        {t('login.signupLink') || 'Sign Up'}
                      </button>
                    </p>
                    <button
                      type="button"
                      onClick={() => setMode('forgot-password')}
                      className="text-sm text-primary hover:text-orange-600 cursor-pointer"
                    >
                      {t('login.forgotPassword') || 'Forgot password?'}
                    </button>
                  </>
                )}
                {mode === 'signup' && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t('login.haveAccount') || 'Already have an account?'}{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-primary hover:text-orange-600 font-medium cursor-pointer"
                    >
                      {t('login.loginLink') || 'Login'}
                    </button>
                  </p>
                )}
                {mode === 'forgot-password' && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t('login.rememberPassword') || 'Remember your password?'}{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-primary hover:text-orange-600 font-medium cursor-pointer"
                    >
                      {t('login.backToLogin') || 'Back to login'}
                    </button>
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Hidden recaptcha container removed - no longer needed */}
    </div>
  );
}
