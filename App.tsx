import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthContext, AuthProvider } from './src/hooks/AuthContext';
import Navigation from './src/components/Navigation';

const Stack = createNativeStackNavigator();

export default function App() {

  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}
