import React, { useContext, useState } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // ✅ ADD THIS
import { loginStyles } from './Login.styles';
import { LoginFormData, useLoginForm } from './Login.form';
import { Controller } from 'react-hook-form';
import { authRepository } from '../../repositories/authRepository';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CommonActions,
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import { AuthContext } from '../../hooks/AuthContext';

function LoginScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useLoginForm();

  const [success, setSuccess] = useState<boolean | null>(null);
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const [secure, setSecure] = useState(true);
  const navigation = useNavigation<NavigationProp<any>>();
  const { login, isLoading } = useContext(AuthContext);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);

      // const res = await authRepository.login(data);
      // setSuccess(true);
      // setMessage(res.message || 'Login successful');
      // await AsyncStorage.setItem('token', res.data.token);
      // navigation.dispatch(
      //     CommonActions.reset({
      //         index: 0,
      //         routes: [{ name: 'Camera' }]
      //     })
      // )
    } catch (err: any) {
      setSuccess(false);
      setMessage(err?.response?.data?.message || 'Invalid Credentials');
    } finally {
      setShow(true);
    }
  };

  return (
    <View style={loginStyles.container}>
      <Text style={loginStyles.headingText}>CheckIn +</Text>

      {show && (
        <Text
          style={[
            loginStyles.message,
            success ? loginStyles.successText : loginStyles.errorText,
          ]}
        >
          {message}
        </Text>
      )}

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={loginStyles.inputText}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.email && (
        <Text style={loginStyles.errors}>{errors.email.message}</Text>
      )}

      <View style={loginStyles.passwordRow}>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[
                loginStyles.inputText,
                {
                  flex: 1,
                  borderWidth: 0,
                  marginBottom: 0,
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                },
              ]}
              placeholder="Password"
              secureTextEntry={secure}
              onChangeText={onChange}
              value={value}
            />
          )}
        />

        <Pressable
          onPress={() => setSecure(!secure)}
          style={loginStyles.iconBtn}
        >
          <Icon
            name={secure ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color="#333"
          />
        </Pressable>
      </View>

      {errors.password && (
        <Text style={loginStyles.errors}>{errors.password.message}</Text>
      )}

      <Pressable
        style={[loginStyles.loginBtn, isSubmitting && loginStyles.disabledBtn]}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={loginStyles.loginBtnText}>Login</Text>
        )}
      </Pressable>
    </View>
  );
}

export default LoginScreen;
