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
        <label className="block text-sm font-medium mb-2">
          {t('login.phoneNumber', 'Phone Number')}
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          onBlur={handlePhoneBlur}
          placeholder="01XXXXXXXXX"
          className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          disabled={isLoading}
        />
      </div>

      {showPasswordInput && (
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('login.password', 'Password')}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('login.enterPassword', 'Enter your password')}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? t('common.loading', 'Loading...') : 
          showPasswordInput ? t('login.loginButton', 'Login') : 
          t('login.continueButton', 'Continue')}
      </button>

      <div className="text-center space-y-2">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t('login.noAccount', "Don't have an account?")}{' '}
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            {t('login.signup', 'Sign Up')}
          </button>
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t('login.forgotPassword', 'Forgot password?')}{' '}
          <button
            type="button"
            onClick={() => switchMode('reset')}
            className="text-green-600 hover:text-green-700 font-medium"
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
        <label className="block text-sm font-medium mb-2">
          {t('login.phoneNumber', 'Phone Number')}
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder="01XXXXXXXXX"
          className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          disabled={isLoading || showPasswordInput}
        />
      </div>

      {showOtpInput && (
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('login.otp', 'Verification Code')}
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder={t('login.enterOtp', 'Enter 6-digit code')}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={isLoading}
            maxLength={6}
          />
          <p className="text-sm text-slate-500 mt-2">
            {t('login.didntReceive', "Didn't receive code?")}{' '}
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendTimer > 0}
              className="text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
            >
              {resendTimer > 0 ? `${resendTimer}s` : t('login.resend', 'Resend')}
            </button>
          </p>
        </div>
      )}

      {showPasswordInput && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('login.password', 'Password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('login.createPassword', 'Create a password')}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isLoading}
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('login.confirmPassword', 'Confirm Password')}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('login.confirmPassword', 'Confirm your password')}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isLoading}
              minLength={6}
            />
          </div>
        </>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? t('common.loading', 'Loading...') : 
          showPasswordInput ? t('login.signupButton', 'Sign Up') : 
          t('login.continueButton', 'Continue')}
      </button>

      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        {t('login.alreadyAccount', 'Already have an account?')}{' '}
        <button
          type="button"
          onClick={() => switchMode('login')}
          className="text-green-600 hover:text-green-700 font-medium"
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
        <label className="block text-sm font-medium mb-2">
          {t('login.phoneNumber', 'Phone Number')}
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder="01XXXXXXXXX"
          className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          disabled={isLoading || showPasswordInput}
        />
      </div>

      {showOtpInput && (
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('login.otp', 'Verification Code')}
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder={t('login.enterOtp', 'Enter 6-digit code')}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={isLoading}
            maxLength={6}
          />
          <p className="text-sm text-slate-500 mt-2">
            {t('login.didntReceive', "Didn't receive code?")}{' '}
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendTimer > 0}
              className="text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
            >
              {resendTimer > 0 ? `${resendTimer}s` : t('login.resend', 'Resend')}
            </button>
          </p>
        </div>
      )}

      {showPasswordInput && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('login.newPassword', 'New Password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('login.enterNewPassword', 'Enter new password')}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isLoading}
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('login.confirmPassword', 'Confirm Password')}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('login.confirmPassword', 'Confirm your password')}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isLoading}
              minLength={6}
            />
          </div>
        </>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? t('common.loading', 'Loading...') : 
          showPasswordInput ? t('login.resetButton', 'Reset Password') : 
          t('login.continueButton', 'Continue')}
      </button>

      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        {t('login.rememberPassword', 'Remember your password?')}{' '}
        <button
          type="button"
          onClick={() => switchMode('login')}
          className="text-green-600 hover:text-green-700 font-medium"
        >
          {t('login.login', 'Login')}
        </button>
      </p>
    </form>
  );

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
      {/* reCAPTCHA container - required for Firebase phone auth */}
      <div id="recaptcha-container"></div>
      
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-6 transition-colors cursor-pointer"
        >
          <Icon name="arrow_back" className="text-xl" />
          <span>{t('common.back', 'Back')}</span>
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon name="calculate" className="text-white text-3xl" />
          </div>
          <h1 className="text-2xl font-bold">
            {t('nav.brand')} <span className="text-green-600">{t('common.hishab')}</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {mode === 'login' && t('login.subtitle', 'Welcome back! Please login to continue.')}
            {mode === 'signup' && t('login.signupSubtitle', 'Create an account to get started.')}
            {mode === 'reset' && t('login.resetSubtitle', 'Reset your password to recover your account.')}
          </p>
        </div>

        {/* Auth form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          {mode === 'login' && renderLoginForm()}
          {mode === 'signup' && renderSignupForm()}
          {mode === 'reset' && renderResetForm()}
        </div>
      </div>
    </div>
  );
}
