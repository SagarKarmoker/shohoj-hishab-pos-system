import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';

interface PasswordResetPageProps {
  token: string;
  onResetSuccess: () => void;
  onBackToLogin: () => void;
}

export function PasswordResetPage({ token, onResetSuccess, onBackToLogin }: PasswordResetPageProps) {
  const { t } = useTranslation();
  const { resetPassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validatePassword = (): boolean => {
    if (!newPassword) {
      setError(t('reset.errors.passwordRequired') || 'Password is required');
      return false;
    }
    
    if (newPassword.length < 8) {
      setError(t('reset.errors.passwordTooShort') || 'Password must be at least 8 characters');
      return false;
    }
    
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    
    if (!hasUppercase || !hasLowercase || !hasNumber) {
      setError(t('reset.errors.passwordRequirements') || 'Password must contain uppercase, lowercase, and number');
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setError(t('reset.errors.passwordMismatch') || 'Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validatePassword()) return;
    
    setIsLoading(true);
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        onResetSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.message || t('reset.errors.failed') || 'Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (): { strength: number; label: string; color: string } => {
    if (!newPassword) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (newPassword.length >= 8) strength++;
    if (newPassword.length >= 12) strength++;
    if (/[A-Z]/.test(newPassword)) strength++;
    if (/[a-z]/.test(newPassword)) strength++;
    if (/[0-9]/.test(newPassword)) strength++;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength++;
    
    if (strength <= 2) return { strength: 33, label: t('reset.passwordStrength.weak') || 'Weak', color: 'bg-red-500' };
    if (strength <= 4) return { strength: 66, label: t('reset.passwordStrength.medium') || 'Medium', color: 'bg-yellow-500' };
    return { strength: 100, label: t('reset.passwordStrength.strong') || 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength();

  if (success) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
              <Icon name="storefront" className="text-white text-3xl" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('nav.brand')}</h1>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-8">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <Icon name="check_circle" className="text-green-600 dark:text-green-400 text-5xl" />
              </div>
              <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
                {t('reset.success.title') || 'Password Reset Successfully!'}
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                {t('reset.success.message') || 'Your password has been changed. You can now login with your new password.'}
              </p>
              <div className="flex items-center justify-center gap-2 text-primary">
                <Icon name="progress_activity" className="animate-spin" />
                <span>{t('reset.redirecting') || 'Redirecting to login...'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
            <Icon name="storefront" className="text-white text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('nav.brand')}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {t('reset.subtitle') || 'Set your new password'}
          </p>
        </div>

        {/* Reset form card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-8">
          <form onSubmit={handleResetPassword} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
                <Icon name="error" className="text-red-600 dark:text-red-400 text-xl flex-shrink-0 mt-0.5" />
                <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('reset.newPassword') || 'New Password'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
              
              {newPassword && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: `${passwordStrength.strength}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {passwordStrength.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('reset.passwordHint') || 'At least 8 characters with uppercase, lowercase, and number'}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('reset.confirmPassword') || 'Confirm Password'}
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
                t('reset.resetButton') || 'Reset Password'
              )}
            </button>

            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
            >
              {t('common.backToLogin') || 'Back to Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
