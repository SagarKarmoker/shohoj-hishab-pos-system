import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import axios from 'axios';
import { 
  sendOTP, 
  verifyOTP, 
  getFirebaseToken, 
  signOut as firebaseSignOut,
  formatBangladeshPhone,
} from '../firebase';
import { ConfirmationResult } from 'firebase/auth';

interface AuthUser {
  uid: string;
  phoneNumber: string;
  email?: string;
  displayName?: string;
  role?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsApproval: boolean;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  phoneNumber: string;
  confirmationResult: ConfirmationResult | null;
  firebaseToken: string | null;
  setPhoneNumber: (phone: string) => void;
  loginWithPhone: () => Promise<void>;
  verifyCode: (code: string) => Promise<any>;
  logout: () => Promise<void>;
  resetAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [firebaseToken, setFirebaseToken] = useState<string | null>(null);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [subscriptionStartDate, setSubscriptionStartDate] = useState<string | undefined>();
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<string | undefined>();

  // Check for existing JWT token on mount
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      setJwtToken(token);
      // Optionally verify token with backend here
    }
    // Check for approval status
    const approvalStatus = localStorage.getItem('needs_approval');
    if (approvalStatus === 'true') {
      setNeedsApproval(true);
    }
    setIsLoading(false);
  }, []);

  const loginWithPhone = useCallback(async () => {
    if (!phoneNumber) {
      throw new Error('Phone number is required');
    }

    const formattedPhone = formatBangladeshPhone(phoneNumber);
    const result = await sendOTP(formattedPhone);
    setConfirmationResult(result);
  }, [phoneNumber]);

  const verifyCode = useCallback(async (code: string): Promise<any> => {
    if (!confirmationResult) {
      throw new Error('No confirmation result available');
    }

    const firebaseUser = await verifyOTP(confirmationResult, code);
    const firebaseToken = await getFirebaseToken(firebaseUser);

    // Send Firebase token to backend for verification and JWT generation
    try {
      const response = await axios.post(`${API_URL}/auth/verify-token`, { firebaseToken });
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
        uid: firebaseUser.uid,
        phoneNumber: firebaseUser.phoneNumber || phoneNumber,
        email: firebaseUser.email || undefined,
        displayName: firebaseUser.displayName || undefined,
        role: data.user.role,
      };
      
      // Store Firebase token for later use (password reset/signup)
      setFirebaseToken(firebaseToken);
      
      setUser(authUser);
      setConfirmationResult(null);
      
      // Return firebase user for token retrieval
      return firebaseUser;
    } catch (error) {
      console.error('Error verifying token with backend:', error);
      throw new Error(error instanceof Error ? error.message : 'Authentication failed');
    }
  }, [confirmationResult, phoneNumber]);

  const logout = useCallback(async () => {
    try {
      await firebaseSignOut();
    } catch (error) {
      console.error('Firebase sign out error:', error);
    }
    
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('needs_approval');
    setJwtToken(null);
    setUser(null);
    setPhoneNumber('');
    setConfirmationResult(null);
    setNeedsApproval(false);
    setSubscriptionStartDate(undefined);
    setSubscriptionEndDate(undefined);
  }, []);

  const resetAuth = useCallback(() => {
    setConfirmationResult(null);
    setPhoneNumber('');
    setFirebaseToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user && !!jwtToken && !needsApproval,
        needsApproval,
        subscriptionStartDate,
        subscriptionEndDate,
        phoneNumber,
        confirmationResult,
        firebaseToken,
        setPhoneNumber,
        loginWithPhone,
        verifyCode,
        logout,
        resetAuth,
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
