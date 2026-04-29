import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    const result = data.data;
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    localStorage.setItem('user', JSON.stringify(result.user));
    setUser(result.user);
    return result.user;
  }, []);

  const superAdminLogin = useCallback(async (email, password) => {
    const { data } = await authAPI.superAdminLogin({ email, password });
    const result = data.data;
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    localStorage.setItem('user', JSON.stringify(result.user));
    setUser(result.user);
    return result.user;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await authAPI.register(formData);
    return data.data;
  }, []);

  /**
   * Register as Enterprise Monthly.
   * The backend auto-generates tokens so the user can immediately access payment endpoints.
   * Stores tokens + a minimal user object in localStorage.
   */
  const registerEnterprise = useCallback(async (formData) => {
    const { data } = await authAPI.register({ ...formData, planType: 'ENTERPRISE_MONTHLY' });
    const result = data.data;
    if (result.accessToken) {
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
      // Build user object from registration result (matches login shape)
      const userObj = {
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.fullName,
        role: 'COMPANY_ADMIN',
        company: { id: result.company.id, name: result.company.name, status: result.company.status },
        subscription: result.subscription,
      };
      localStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);
    }
    return result;
  }, []);

  const googleLogin = useCallback(async (accessToken) => {
    const { data } = await authAPI.googleAuth(accessToken);
    const result = data.data;
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    localStorage.setItem('user', JSON.stringify(result.user));
    setUser(result.user);
    return result;
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch {
      // Ignore logout errors
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    login,
    superAdminLogin,
    register,
    registerEnterprise,
    googleLogin,
    logout,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === 'SUPER_ADMIN',
    isCompanyAdmin: user?.role === 'COMPANY_ADMIN',
    isStaff: user?.role === 'COMPANY_STAFF',
    
    // Subscription state
    subscription: user?.subscription || null,
    subscriptionStatus: user?.subscription?.status || null,
    
    // Subscription convenience getters
    isTrialing: user?.subscription?.status === 'TRIALING',
    isTrialExpired:
      user?.subscription?.status === 'TRIALING' &&
      !!user?.subscription?.trialEndsAt &&
      new Date(user.subscription.trialEndsAt) < new Date(),
    isActive: user?.subscription?.status === 'ACTIVE',
    isPendingPayment: user?.subscription?.status === 'PENDING_PAYMENT',
    isPastDue: user?.subscription?.status === 'PAST_DUE',
    isExpired: user?.subscription?.status === 'EXPIRED',
    isCancelled: user?.subscription?.status === 'CANCELLED',
    isPendingActivation: user?.subscription?.status === 'PENDING_ACTIVATION',
    
    // Billing access state
    isBillingRequired:
      (user?.subscription?.status === 'TRIALING' &&
        !!user?.subscription?.trialEndsAt &&
        new Date(user.subscription.trialEndsAt) < new Date()) ||
      ['PENDING_PAYMENT', 'EXPIRED', 'CANCELLED', 'PAST_DUE', 'PENDING_ACTIVATION'].includes(
        user?.subscription?.status
      ),
    
    /**
     * Check if user can perform an action based on subscription status
     * @param {string} action - 'read' | 'write' | 'delete'
     * @returns {boolean}
     */
    canAccess: (action = 'read') => {
      if (user?.role === 'SUPER_ADMIN') return true;
      
      const status = user?.subscription?.status;
      if (!status) return false;
      
      // Check trial expiration
      if (status === 'TRIALING') {
        if (user?.subscription?.trialEndsAt && new Date(user.subscription.trialEndsAt) < new Date()) {
          return false; // Trial expired, block all
        }
        // Trial active - allow read, create/update, but not delete
        return action !== 'delete';
      }
      
      if (status === 'ACTIVE') return true; // Full access
      
      if (status === 'PENDING_PAYMENT') {
        return action === 'read'; // Read-only for pending payment
      }
      
      // EXPIRED, CANCELLED, PAST_DUE, PENDING_ACTIVATION all block access
      return false;
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
