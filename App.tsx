import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthContext, AuthProvider } from './src/hooks/AuthContext';
import Navigation from './src/components/Navigation';

const Stack = createNativeStackNavigator();

export default function App() {
  const { userInfo } = React.useContext(AuthContext);
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}
