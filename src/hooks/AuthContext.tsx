import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { authRepository } from '../repositories/authRepository';

interface UserInfo {
  token: string;
  [key: string]: any;
}

interface AuthContextProps {
  userInfo: UserInfo | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextProps>({
  userInfo: null,
  isLoading: false,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authRepository.login({ email, password });

      const token = res?.data?.token;
      if (!token) throw new Error('Token missing');

      const user = { token, ...res.data };

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(user));

      setUserInfo(user);

      console.log('✅ Login success');
    } catch (error: any) {
      console.log('❌ Login error:', error?.response?.data || error.message);
      Alert.alert(
        'Login Failed',
        error?.response?.data?.message || error.message,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'userInfo']);
    setUserInfo(null);
    console.log('✅ Logged out');
  };

  const loadUser = async () => {
    const storedUser = await AsyncStorage.getItem('userInfo');
    if (storedUser) {
      setUserInfo(JSON.parse(storedUser));
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ userInfo, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
