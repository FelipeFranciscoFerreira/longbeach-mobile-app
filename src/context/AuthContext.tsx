import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole, DriverProfile, ClientProfile } from '@/types';
import { ApiService } from '@/services/api';
import {
  MOCK_DRIVER_USER,
  MOCK_DRIVER_PROFILE,
  MOCK_CLIENT_USER,
  MOCK_CLIENT_PROFILE,
} from '@/services/mockData';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  token: string | null;
  driverProfile: DriverProfile | null;
  clientProfile: ClientProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchRole: (newRole: 'DRIVER' | 'CLIENT') => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const AUTH_USER_KEY = '@longbeach_auth_user';
const AUTH_TOKEN_KEY = '@longbeach_auth_token';
const AUTH_ROLE_KEY = '@longbeach_auth_role';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore stored session on mount
  useEffect(() => {
    async function loadSession() {
      try {
        const storedUser = await AsyncStorage.getItem(AUTH_USER_KEY);
        const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        const storedRole = (await AsyncStorage.getItem(AUTH_ROLE_KEY)) as UserRole | null;

        if (storedUser && storedToken && storedRole) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);
          setRole(storedRole);

          if (storedRole === 'DRIVER') {
            setDriverProfile(MOCK_DRIVER_PROFILE);
          } else {
            setClientProfile(MOCK_CLIENT_PROFILE);
          }
        }
      } catch (err) {
        console.warn('Failed to restore auth session:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await ApiService.login(email, password);
      if (res && res.access_token) {
        const loggedUser: User = {
          id: res.user_id,
          email: res.email,
          full_name: res.full_name,
          role: res.role,
          is_active: true,
        };

        setUser(loggedUser);
        setRole(res.role);
        setToken(res.access_token);

        if (res.role === 'DRIVER') {
          setDriverProfile(MOCK_DRIVER_PROFILE);
          setClientProfile(null);
        } else {
          setClientProfile(MOCK_CLIENT_PROFILE);
          setDriverProfile(null);
        }

        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(loggedUser));
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, res.access_token);
        await AsyncStorage.setItem(AUTH_ROLE_KEY, res.role);

        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setRole(null);
    setToken(null);
    setDriverProfile(null);
    setClientProfile(null);
    await AsyncStorage.removeItem(AUTH_USER_KEY);
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(AUTH_ROLE_KEY);
  };

  const switchRole = async (newRole: 'DRIVER' | 'CLIENT') => {
    if (newRole === 'DRIVER') {
      await login(MOCK_DRIVER_USER.email, 'driver123');
    } else {
      await login(MOCK_CLIENT_USER.email, 'client123');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        driverProfile,
        clientProfile,
        isAuthenticated: Boolean(user && token),
        isLoading,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
