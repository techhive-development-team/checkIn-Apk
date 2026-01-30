import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';
import { baseUrl } from '../enums/urls';

interface UserInfo {
  token: string;
  message?: string;
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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await axios.post<UserInfo>(`${baseUrl}/auth/login`, {
        email,
        password,
      });

      const data = res.data;

      await AsyncStorage.setItem('userInfo', JSON.stringify(data));
      await AsyncStorage.setItem('token', data.token);

      setUserInfo(data);

      console.log('Login success:', data);
    } catch (error: any) {
      console.log('Login failed:', error.response?.data || error.message);
      Alert.alert(
        'Login Failed',
        error.response?.data?.message || 'Please try again'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userInfo');
    await AsyncStorage.removeItem('token');
    setUserInfo(null);
  };

  const loadUser = async () => {
    const storedUser = await AsyncStorage.getItem('userInfo');
    if (storedUser) setUserInfo(JSON.parse(storedUser));
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
