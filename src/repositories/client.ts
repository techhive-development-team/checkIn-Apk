import { baseURL } from './../enums/urls';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const exec = async (url: string, config?: any) => {
  console.log(url);
  console.log(config)
  const response = await axiosInstance({
    url,
    ...config,
  });
  return response.data;
};

export const client = { exec };
