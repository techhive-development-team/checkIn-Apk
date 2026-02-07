import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthContext, AuthProvider } from './src/hooks/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

const Stack = createNativeStackNavigator();

export default function App() {

  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
