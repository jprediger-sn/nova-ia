import { useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { cognitoClient } from '@/lib/cognito/client';
import type { AuthContextValue, User, LoginCredentials } from '../types/auth.types';
import { AuthContext } from './auth-context.types';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const checkSession = useCallback(async () => {
    try {
      const currentUser = await cognitoClient.checkSession();
      setUser(currentUser);
    } catch (error) {
      console.error('Error checking session:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsAuthenticating(true);
    try {
      const authenticatedUser = await cognitoClient.login(credentials);
      setUser(authenticatedUser);
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await cognitoClient.logout();
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
      // Mesmo com erro, limpa o estado local
      setUser(null);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const refreshedUser = await cognitoClient.refreshSession();
      setUser(refreshedUser);
    } catch (error) {
      console.error('Error refreshing session:', error);
      setUser(null);
      throw error;
    }
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isAuthenticating,
    login,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


