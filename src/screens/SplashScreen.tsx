import React, { useContext, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { AuthContext } from '../hooks/AuthContext';

export default function SplashScreen({ navigation }: any) {
  const { userInfo } = useContext(AuthContext);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (userInfo?.token) {
        navigation.replace('Camera');
      } else {
        navigation.replace('Login');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [userInfo]);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>TechHive</Text>

      <ActivityIndicator size="large" color="#4f46e5" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
