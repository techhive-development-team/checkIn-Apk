import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useContext } from 'react';

import { AuthContext } from '../hooks/AuthContext';
import LoginScreen from '../features/Login/LoginScreen';
import CameraScreen from '../features/Camera/CameraScreen';
import ReviewScreen from '../features/Review/ReviewScreen';

type RootStackParamList = {
  Login: undefined;
  Camera: undefined;
  Review: {
    imagePath: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { userInfo } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!userInfo?.token ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Camera" component={CameraScreen} />
            <Stack.Screen name="Review" component={ReviewScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
