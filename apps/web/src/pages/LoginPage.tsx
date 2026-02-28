 import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface LoginPageProps {
  onBackToHome: () => void;
  onLoginSuccess: () => void;
}

type AuthMode = 'login' | 'signup' | 'reset';

export function LoginPage({ onBackToHome, onLoginSuccess }: LoginPageProps) {
  const { t } = useTranslation();
  const { 
    phoneNumber, 
    setPhoneNumber, 
    confirmationResult, 
    loginWithPhone, 
    verifyCode, 
    logout,
    resetAuth,
    firebaseToken,
  } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [userExists, setUserExists] = useState<boolean | null>(null);

  // Reset form when mode changes
  useEffect(() => {
    setError(null);
    setOtp('');
    setPassword('');
    setConfirmPassword('');
    setShowOtpInput(false);
    setShowPasswordInput(false);
    setResendTimer(0);
  }, [mode]);

  // Check if user exists when phone number changes
  const checkUserExists = async (phone: string) => {
    // Basic validation first
    const phoneRegex = /^(\+88)?[01][0-9]{9,10}$/;
    const cleanPhone = phone.replace(/\s/g, '');
    
    if (phoneRegex.test(cleanPhone)) {
      try {
        const formattedPhone = formatPhoneNumber(phone);
        const response = await axios.post(`${API_URL}/auth/check-user`, {
          phoneNumber: formattedPhone,
        });
        setUserExists(response.data.exists);
        
        // If user exists and trying to login, show password field
        // If user doesn't exist and trying to login, suggest signup
        if (mode === 'login' && response.data.exists && response.data.hasPassword) {
          setShowPasswordInput(true);
        } else if (mode === 'login' && response.data.exists && !response.data.hasPassword) {
          setError(t('login.errors.setPasswordFirst'));
        }
      } catch (err) {
        console.error('Error checking user:', err);
      }
    }
  };

  const formatPhoneNumber = (phone: string): string => {
    let cleaned = phone.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    if (!cleaned.startsWith('+')) {
      cleaned = '+88' + cleaned;
    }
    return cleaned;
  };

  const validatePhone = (): boolean => {
    if (!phoneNumber.trim()) {
      setError(t('login.errors.phoneRequired'));
      return false;
    }

    // Validate phone number format for Bangladesh
    const phoneRegex = /^(\+88)?[01][0-9]{9,10}$/;
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      setError(t('login.errors.phoneInvalid'));
      return false;
    }
    return true;
  };

  const validatePassword = (): boolean => {
    if (!password || password.length < 6) {
      setError(t('login.errors.passwordMin', 'Password must be at least 6 characters'));
      return false;
    }
    if (mode === 'signup' && password !== confirmPassword) {
      setError(t('login.errors.passwordMismatch'));
      return false;
    }
    return true;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validatePhone()) return;

    setIsLoading(true);
    try {
      await loginWithPhone();
      setShowOtpInput(true);
      // Start resend timer
      setResendTimer(60);
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Error sending OTP:', err);
      setError(err instanceof Error ? err.message : t('login.errors.smsFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp.trim() || otp.length < 6) {
      setError(t('login.errors.otpRequired'));
      return;
    }

    setIsLoading(true);
    try {
      // Verify OTP and get JWT token
      // Note: verifyCode() already calls /auth/verify-token internally
      await verifyCode(otp);
      
      // After OTP verification, show password input for signup/reset
      setShowPasswordInput(true);
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError(err instanceof Error ? err.message : t('login.errors.invalidOtp'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validatePhone() || !validatePassword()) return;

    setIsLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      const response = await axios.post(`${API_URL}/auth/login`, {
        phoneNumber: formattedPhone,
        password,
      });

      const data = response.data;

      // Check if user needs approval BEFORE storing token
      if (data.needsApproval) {
        localStorage.setItem('needs_approval', 'true');
        setError(t('login.errors.needsApproval') || 'Your account is pending approval. Please contact admin.');
        return;
      }

      // Store JWT token only after approval check
      localStorage.setItem('jwt_token', data.token);
      
      // Set user data
      onLoginSuccess();
    } catch (err: any) {
      console.error('Error logging in:', err);
      setError(err.response?.data?.message || t('login.errors.invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validatePhone() || !validatePassword()) return;

    setIsLoading(true);
    try {
      // Use the stored Firebase token from AuthContext
      if (!firebaseToken) {
        throw new Error('Please verify your phone number first');
      }

      // Call signup endpoint with Firebase token and password
      const response = await axios.post(`${API_URL}/auth/signup`, {
        firebaseToken,
        password,
      });

      // Store JWT token
      localStorage.setItem('jwt_token', response.data.token);
      
      // Set user data
      onLoginSuccess();
    } catch (err: any) {
      console.error('Error signing up:', err);
      setError(err.response?.data?.message || t('login.errors.signupFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validatePassword()) return;

    setIsLoading(true);
    try {
      // Use the stored Firebase token from AuthContext
      if (!firebaseToken) {
        throw new Error('Please verify your phone number first');
      }

      // Call reset password endpoint
      await axios.post(`${API_URL}/auth/reset-password`, {
        firebaseToken,
        newPassword: password,
      });

      // Show success message and redirect to login
      setError(null);
      alert(t('login.messages.passwordResetSuccess'));
      setMode('login');
      setShowOtpInput(false);
      setShowPasswordInput(false);
      setOtp('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Error resetting password:', err);
      setError(err.response?.data?.message || t('login.errors.resetFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setError(null);
    setOtp('');
    try {
      await loginWithPhone();
      setResendTimer(60);
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Error resending OTP:', err);
      setError(err instanceof Error ? err.message : t('login.errors.smsFailed'));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
    setUserExists(null);
    setShowPasswordInput(false);
    setError(null);
  };

  const handlePhoneBlur = () => {
    if (mode === 'login' && phoneNumber.trim()) {
      checkUserExists(phoneNumber);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setPhoneNumber('');
    setOtp('');
    setPassword('');
    setConfirmPassword('');
    setUserExists(null);
    setShowOtpInput(false);
    setShowPasswordInput(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  // Render login form
  const renderLoginForm = () => (
    <form onSubmit={handleSendOTP} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
          {t('login.phoneNumber', 'Phone Number')}
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          onBlur={handlePhoneBlur}
          placeholder="01XXXXXXXXX"
          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100"
          disabled={isLoading}
        />
      </div>

      {showPasswordInput && (
        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
            {t('login.password', 'Password')}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('login.enterPassword', 'Enter your password')}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100"
            disabled={isLoading}
          />
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium flex items-start gap-2">
          <Icon name="error" className="text-lg flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 px-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {t('common.loading', 'Loading...')}
          </span>
        ) : (
          showPasswordInput ? t('login.loginButton', 'Login') : t('login.continueButton', 'Continue')
        )}
      </button>

      <div className="text-center space-y-3 pt-2">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t('login.noAccount', "Don't have an account?")}{' '}
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className="text-primary hover:text-primary-hover font-semibold transition-colors"
          >
            {t('login.signup', 'Sign Up')}
          </button>
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t('login.forgotPassword', 'Forgot password?')}{' '}
          <button
            type="button"
            onClick={() => switchMode('reset')}
            className="text-primary hover:text-primary-hover font-semibold transition-colors"
          >
            {t('login.reset', 'Reset')}
          </button>
        </p>
      </div>
    </form>
  );

  // Render signup form
  const renderSignupForm = () => (
    <form onSubmit={showPasswordInput ? handleSignup : handleSendOTP} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
          {t('login.phoneNumber', 'Phone Number')}
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder="01XXXXXXXXX"
          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100"
          disabled={isLoading || showPasswordInput}
        />
      </div>

      {showOtpInput && (
        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
            {t('login.otp', 'Verification Code')}
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder={t('login.enterOtp', 'Enter 6-digit code')}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100 text-center text-2xl tracking-widest font-bold"
            disabled={isLoading}
            maxLength={6}
          />
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 text-center">
            {t('login.didntReceive', "Didn't receive code?")}{' '}
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendTimer > 0}
              className="text-primary hover:text-primary-hover font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {resendTimer > 0 ? `${resendTimer}s` : t('login.resend', 'Resend')}
            </button>
          </p>
        </div>
      )}

      {showPasswordInput && (
        <>
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
              {t('login.password', 'Password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('login.createPassword', 'Create a password')}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100"
              disabled={isLoading}
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
              {t('login.confirmPassword', 'Confirm Password')}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('login.confirmPassword', 'Confirm your password')}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100"
              disabled={isLoading}
              minLength={6}
            />
          </div>
        </>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium flex items-start gap-2">
          <Icon name="error" className="text-lg flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 px-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {t('common.loading', 'Loading...')}
          </span>
        ) : (
          showPasswordInput ? t('login.signupButton', 'Sign Up') : t('login.continueButton', 'Continue')
        )}
      </button>

      <p className="text-center text-sm text-slate-600 dark:text-slate-400 pt-2">
        {t('login.alreadyAccount', 'Already have an account?')}{' '}
        <button
          type="button"
          onClick={() => switchMode('login')}
          className="text-primary hover:text-primary-hover font-semibold transition-colors"
        >
          {t('login.login', 'Login')}
        </button>
      </p>
    </form>
  );

  // Render reset password form
  const renderResetForm = () => (
    <form onSubmit={showPasswordInput ? handleResetPassword : handleSendOTP} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
          {t('login.phoneNumber', 'Phone Number')}
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder="01XXXXXXXXX"
          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100"
          disabled={isLoading || showPasswordInput}
        />
      </div>

      {showOtpInput && (
        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
            {t('login.otp', 'Verification Code')}
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder={t('login.enterOtp', 'Enter 6-digit code')}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100 text-center text-2xl tracking-widest font-bold"
            disabled={isLoading}
            maxLength={6}
          />
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 text-center">
            {t('login.didntReceive', "Didn't receive code?")}{' '}
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendTimer > 0}
              className="text-primary hover:text-primary-hover font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {resendTimer > 0 ? `${resendTimer}s` : t('login.resend', 'Resend')}
            </button>
          </p>
        </div>
      )}

      {showPasswordInput && (
        <>
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
              {t('login.newPassword', 'New Password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('login.enterNewPassword', 'Enter new password')}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100"
              disabled={isLoading}
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
              {t('login.confirmPassword', 'Confirm Password')}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('login.confirmPassword', 'Confirm your password')}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100"
              disabled={isLoading}
              minLength={6}
            />
          </div>
        </>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium flex items-start gap-2">
          <Icon name="error" className="text-lg flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 px-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {t('common.loading', 'Loading...')}
          </span>
        ) : (
          showPasswordInput ? t('login.resetButton', 'Reset Password') : t('login.continueButton', 'Continue')
        )}
      </button>

      <p className="text-center text-sm text-slate-600 dark:text-slate-400 pt-2">
        {t('login.rememberPassword', 'Remember your password?')}{' '}
        <button
          type="button"
          onClick={() => switchMode('login')}
          className="text-primary hover:text-primary-hover font-semibold transition-colors"
        >
          {t('login.login', 'Login')}
        </button>
      </p>
    </form>
  );

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-pattern pointer-events-none opacity-50"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-100 dark:bg-orange-900/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-0 -left-24 w-72 h-72 bg-orange-50 dark:bg-orange-900/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      
      {/* reCAPTCHA container - required for Firebase phone auth */}
      <div id="recaptcha-container"></div>
      
      {/* Back button - Fixed position */}
      <button
        onClick={onBackToHome}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary hover:border-primary dark:hover:border-primary shadow-lg hover:shadow-xl transition-all hover:-translate-x-1 cursor-pointer group"
      >
        <Icon name="arrow_back" className="text-xl group-hover:scale-110 transition-transform" />
        <span className="font-semibold text-sm">{t('common.back', 'Back')}</span>
      </button>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-500/30 transform hover:scale-105 transition-transform">
            <Icon name="calculate" className="text-white text-4xl" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {t('nav.brand')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            {mode === 'login' && t('login.subtitle', 'Welcome back! Please login to continue.')}
            {mode === 'signup' && t('login.signupSubtitle', 'Create an account to get started.')}
            {mode === 'reset' && t('login.resetSubtitle', 'Reset your password to recover your account.')}
          </p>
        </div>

        {/* Auth form */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-8 backdrop-blur-sm">
          {mode === 'login' && renderLoginForm()}
          {mode === 'signup' && renderSignupForm()}
          {mode === 'reset' && renderResetForm()}
        </div>
      </div>
    </div>
  );
}
