import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Hydrate user on mount if cookie or token is present
  const checkAuthStatus = useCallback(async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
    } catch (error) {
      // Session invalid or not logged in; clear token silently
      localStorage.removeItem('rescrafted_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (credentials) => {
    try {
      const result = await authService.login(credentials);
      setUser(result.user);
      toast.success(`Welcome back, ${result.user.name}!`);
      return result;
    } catch (error) {
      toast.error(error.message || 'Login failed. Please check your credentials.');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const result = await authService.register(userData);
      setUser(result.user);
      toast.success(
        'Account created! Please check your email or preview console for your verification code.'
      );
      return result;
    } catch (error) {
      toast.error(error.message || 'Registration failed.');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast.info('You have been signed out.');
    } catch (error) {
      setUser(null);
      localStorage.removeItem('rescrafted_token');
    }
  };

  const verifyEmail = async ({ email, otp }) => {
    try {
      const result = await authService.verifyEmail({ email, otp });
      setUser(result.user);
      toast.success('Email successfully verified! Thank you for joining ResCrafted.');
      return result;
    } catch (error) {
      toast.error(error.message || 'Failed to verify OTP.');
      throw error;
    }
  };

  const resendOtp = async (email) => {
    try {
      await authService.resendOtp({ email });
      toast.success('A fresh verification code has been dispatched to your email.');
    } catch (error) {
      toast.error(error.message || 'Failed to resend code.');
      throw error;
    }
  };

  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isSeller: user?.role === 'seller',
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    verifyEmail,
    resendOtp,
    updateUser,
    refreshUser: checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
