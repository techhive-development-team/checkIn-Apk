import React from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp<any>>()
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput placeholder="Email" style={styles.input} />
      <TextInput placeholder="Password" secureTextEntry style={styles.input} />

      <Button title="Login" onPress={() => {navigation.navigate('Camera')}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#00A8CC'
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
