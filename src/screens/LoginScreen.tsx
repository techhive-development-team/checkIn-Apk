import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert } from 'react-native';
import { useNavigation, NavigationProp, CommonActions } from '@react-navigation/native';
import { AuthContext } from '../hooks/AuthContext';
// import { LoginSchema } from '../components/LoginValidation';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useContext(AuthContext);
  const navigation = useNavigation<NavigationProp<any>>();

  // const handleLogin = async () => {
  //   try {
  //     await LoginSchema.validate({ email, password });
  //     await login(email, password);
  //   } catch (err: any) {
  //     Alert.alert('Validation Error', err.message);
  //   }
  // };

  const handleLogin = async () => {
    try {
      // await LoginSchema.validate({ email, password });
      await login(email, password);
      const lastAction = await AsyncStorage.getItem('lastAction');

      if (lastAction === 'checkIn') {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Camera' }],
          }),
        );
      } else {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Camera' }],
          }),
        );
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Login failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        style={styles.input}
        onChangeText={setPassword}
      />

      <Button
        title={isLoading ? 'Logging in...' : 'Login'}
        onPress={handleLogin}
        disabled={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#00A8CC',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
});
