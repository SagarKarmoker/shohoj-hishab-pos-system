import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';

interface EmailVerificationPageProps {
  token: string;
  onVerificationSuccess: () => void;
  onBackToLogin: () => void;
}

type VerificationState = 'verifying' | 'success' | 'error';

export function EmailVerificationPage({ token, onVerificationSuccess, onBackToLogin }: EmailVerificationPageProps) {
  const { t } = useTranslation();
  const { verifyEmail, resendVerification, email } = useAuth();
  const [state, setState] = useState<VerificationState>('verifying');
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (token) {
      handleVerification();
    }
  }, [token]);

  const handleVerification = async () => {
    setState('verifying');
    setError(null);
    
    try {
      await verifyEmail(token);
      setState('success');
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        onVerificationSuccess();
      }, 2000);
    } catch (err: any) {
      setState('error');
      setError(err.message || t('verification.errors.failed') || 'Email verification failed');
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError(t('verification.errors.noEmail') || 'Email address not found');
      return;
    }

    setIsResending(true);
    setError(null);
    
    try {
      await resendVerification(email);
      setError(null);
      alert(t('verification.success.resent') || 'Verification email resent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message || t('verification.errors.resendFailed') || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
            <Icon name="storefront" className="text-white text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('nav.brand')}</h1>
        </div>

        {/* Verification card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-8">
          <div className="text-center space-y-6">
            {state === 'verifying' && (
              <>
                <div className="w-20 h-20 mx-auto mb-4">
                  <div className="w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {t('verification.verifying') || 'Verifying Your Email...'}
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  {t('verification.pleaseWait') || 'Please wait while we verify your email address.'}
                </p>
              </>
            )}

            {state === 'success' && (
              <>
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="check_circle" className="text-green-600 dark:text-green-400 text-5xl" />
                </div>
                <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {t('verification.success.title') || 'Email Verified!'}
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  {t('verification.success.message') || 'Your email has been successfully verified. Redirecting to dashboard...'}
                </p>
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Icon name="progress_activity" className="animate-spin" />
                  <span>{t('common.loading') || 'Loading...'}</span>
                </div>
              </>
            )}

            {state === 'error' && (
              <>
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="error" className="text-red-600 dark:text-red-400 text-5xl" />
                </div>
                <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {t('verification.error.title') || 'Verification Failed'}
                </h2>
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}
                <p className="text-slate-600 dark:text-slate-400">
                  {t('verification.error.message') || 'The verification link may have expired or is invalid.'}
                </p>

                <div className="space-y-3 pt-4">
                  <button
                    onClick={handleResendVerification}
                    disabled={isResending || !email}
                    className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isResending ? (
                      <span className="flex items-center justify-center gap-2">
                        <Icon name="progress_activity" className="animate-spin" />
                        {t('common.loading') || 'Loading...'}
                      </span>
                    ) : (
                      t('verification.resendButton') || 'Resend Verification Email'
                    )}
                  </button>

                  <button
                    onClick={onBackToLogin}
                    className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                  >
                    {t('common.backToLogin') || 'Back to Login'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
