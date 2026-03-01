import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import axios from 'axios';

interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  role?: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsApproval: boolean;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  email: string;
  setEmail: (email: string) => void;
  signup: (email: string, password: string, displayName?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [subscriptionStartDate, setSubscriptionStartDate] = useState<string | undefined>();
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<string | undefined>();

  // Check for existing JWT token on mount and fetch user profile
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    const approvalStatus = localStorage.getItem('needs_approval') === 'true';
    setNeedsApproval(approvalStatus);

    if (token) {
      setJwtToken(token);
      axios
        .get(`${API_URL}/auth/profile`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          setUser({
            id: res.data.id,
            email: res.data.email,
            displayName: res.data.displayName,
            role: res.data.role,
            emailVerified: true,
          });
        })
        .catch(() => {
          localStorage.removeItem('jwt_token');
          setJwtToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, displayName?: string): Promise<void> => {
    try {
      await axios.post(`${API_URL}/auth/signup`, { email, password, displayName });
      // Signup successful - user needs to verify email
      setEmail(email);
    } catch (error) {
      console.error('Signup error:', error);
      throw new Error(error instanceof Error ? error.message : 'Signup failed');
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const data = response.data;
    
      // Store JWT token
      localStorage.setItem('jwt_token', data.token);
      setJwtToken(data.token);

      // Store approval status and subscription dates
      setNeedsApproval(data.needsApproval || false);
      setSubscriptionStartDate(data.subscriptionStartDate);
      setSubscriptionEndDate(data.subscriptionEndDate);
      localStorage.setItem('needs_approval', String(data.needsApproval || false));

      // Set user data
      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        displayName: data.user.displayName,
        role: data.user.role,
        emailVerified: data.user.emailVerified,
      };
      
      setUser(authUser);
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  }, []);

  const verifyEmail = useCallback(async (token: string): Promise<void> => {
    try {
      const response = await axios.get(`${API_URL}/auth/verify-email?token=${token}`);
      const data = response.data;
    
      // Store JWT token
      localStorage.setItem('jwt_token', data.token);
      setJwtToken(data.token);

      // Store approval status and subscription dates
      setNeedsApproval(data.needsApproval || false);
      setSubscriptionStartDate(data.subscriptionStartDate);
      setSubscriptionEndDate(data.subscriptionEndDate);
      localStorage.setItem('needs_approval', String(data.needsApproval || false));

      // Set user data
      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        displayName: data.user.displayName,
        role: data.user.role,
        emailVerified: true,
      };
      
      setUser(authUser);
    } catch (error) {
      console.error('Email verification error:', error);
      throw new Error(error instanceof Error ? error.message : 'Email verification failed');
    }
  }, []);

  const requestPasswordReset = useCallback(async (email: string): Promise<void> => {
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
    } catch (error) {
      console.error('Password reset request error:', error);
      throw new Error(error instanceof Error ? error.message : 'Password reset request failed');
    }
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string): Promise<void> => {
    try {
      await axios.post(`${API_URL}/auth/reset-password`, { token, newPassword });
    } catch (error) {
      console.error('Password reset error:', error);
      throw new Error(error instanceof Error ? error.message : 'Password reset failed');
    }
  }, []);

  const resendVerification = useCallback(async (email: string): Promise<void> => {
    try {
      await axios.post(`${API_URL}/auth/resend-verification`, { email });
    } catch (error) {
      console.error('Resend verification error:', error);
      throw new Error(error instanceof Error ? error.message : 'Resend verification failed');
    }
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('needs_approval');
    setJwtToken(null);
    setUser(null);
    setEmail('');
    setNeedsApproval(false);
    setSubscriptionStartDate(undefined);
    setSubscriptionEndDate(undefined);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user && !!jwtToken && !needsApproval && user.emailVerified,
        needsApproval,
        subscriptionStartDate,
        subscriptionEndDate,
        email,
        setEmail,
        signup,
        login,
        verifyEmail,
        requestPasswordReset,
        resetPassword,
        resendVerification,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper hook to get JWT token
export function useJwtToken() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    setToken(token);
  }, []);

  return token;
}
