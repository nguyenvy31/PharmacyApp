// app/screens/auth/LoginScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../config/colors';
import api from '../../config/api';
import { configureGoogleSignIn, signInWithGoogle } from '../../config/google';
import { signInWithFacebook } from '../../config/facebook';
import { useCart } from '../../context/CartContext';

export default function LoginScreen({ navigation }) {
  const [isPhoneLogin, setIsPhoneLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { reloadCart } = useCart();

  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  const validateEmail = (value) => /\S+@\S+\.\S+/.test(value);

  const saveUserToStorage = async (user, token) => {
    try {
      await AsyncStorage.setItem('authUser', JSON.stringify(user));
      await AsyncStorage.setItem('authToken', token);
    } catch (e) {
      console.log('Error saving:', e);
    }
  };

  // ================== HANDLE GOOGLE LOGIN ==================
  const handleGoogleLogin = async () => {
    try {
      console.log('=== START GOOGLE LOGIN ===');

      // Optional: sign out trước khi sign in để debug
      // await signOutGoogle();

      const idToken = await signInWithGoogle();
      console.log('✅ ID token received:', !!idToken);

      if (!idToken) {
        Alert.alert('Lỗi', 'Không thể lấy token từ Google');
        return;
      }

      // Gửi token lên backend
      const response = await fetch(api.AUTH_LOGIN_GOOGLE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();
      console.log('✅ Backend response:', data);

      if (!data.success) {
        Alert.alert('Đăng nhập thất bại', data.message || 'Không thể đăng nhập với Google');
        return;
      }

      const { token, user } = data.data;
      if (!user) {
        Alert.alert('Lỗi', 'Server không trả về thông tin user.');
        return;
      }


      await saveUserToStorage(user, token);
      await reloadCart();
      navigation.replace('MainTabs');
    } catch (error) {
      console.error('❌ GOOGLE LOGIN ERROR:', error.code, error.message);

      let errorMessage = 'Đã xảy ra lỗi khi đăng nhập Google';
      if (error.code === 10) {
        errorMessage = `Lỗi DEVELOPER_ERROR:`;
      }
      Alert.alert('Lỗi', errorMessage);
    }
  };

  // ================== HANDLE FACEBOOK LOGIN ==================
  const handleFacebookLogin = async () => {
    try {
      console.log('=== START FACEBOOK LOGIN ===');

      const accessToken = await signInWithFacebook();
      console.log('✅ FB accessToken:', !!accessToken);

      if (!accessToken) {
        Alert.alert('Lỗi', 'Không thể đăng nhập Facebook');
        return;
      }

      const response = await fetch(api.AUTH_LOGIN_FACEBOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });

      const data = await response.json();

      if (!data.success) {
        Alert.alert('Đăng nhập thất bại', data.message);
        return;
      }
      const { token, user } = data.data;

      await saveUserToStorage(user, token);
      await reloadCart();
      navigation.replace('MainTabs');
    } catch (error) {
      console.error('FACEBOOK LOGIN ERROR:', error);
      Alert.alert('Lỗi', 'Đăng nhập Facebook thất bại');
    }
  };


  // ================== HANDLE REGULAR LOGIN ==================
  const handleLogin = async () => {
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedPassword) {
      Alert.alert('Thông báo', 'Vui lòng nhập mật khẩu.');
      return;
    }
    if (trimmedPassword.length < 6) {
      Alert.alert('Thông báo', 'Mật khẩu phải tối thiểu 6 ký tự.');
      return;
    }

    let body = {};
    let url = '';

    if (isPhoneLogin) {
      if (!trimmedPhone || trimmedPhone.length < 9) {
        Alert.alert('Thông báo', 'Số điện thoại không hợp lệ.');
        return;
      }
      body = { phone: trimmedPhone, password: trimmedPassword };
      url = api.AUTH_LOGIN;
    } else {
      if (!trimmedEmail || !validateEmail(trimmedEmail)) {
        Alert.alert('Thông báo', 'Email không hợp lệ.');
        return;
      }
      body = { email: trimmedEmail, password: trimmedPassword };
      url = api.AUTH_LOGIN_EMAIL;
    }

    try {
      console.log("URL:", url);
      console.log("BODY:", body);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      console.log("STATUS:", response.status);

      const text = await response.text();
      console.log("RAW:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        Alert.alert("Lỗi", "Server trả về dữ liệu không hợp lệ");
        return;
      }

      if (!response.ok) {
        Alert.alert("Lỗi", data.message || "Request failed");
        return;
      }

      if (!data.success) {
        Alert.alert('Đăng nhập thất bại', data.message || '');
        return;
      }

      const { token, user } = data.data;

      await saveUserToStorage(user, token);
      await reloadCart();
      navigation.replace('MainTabs');

    } catch (error) {
      console.error('Login error FULL:', error);
      Alert.alert('Lỗi', 'Không kết nối được server.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Đăng nhập</Text>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, isPhoneLogin && styles.toggleButtonActive]}
            onPress={() => setIsPhoneLogin(true)}
          >
            <Text style={[styles.toggleText, isPhoneLogin && styles.toggleTextActive]}>Số điện thoại</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, !isPhoneLogin && styles.toggleButtonActive]}
            onPress={() => setIsPhoneLogin(false)}
          >
            <Text style={[styles.toggleText, !isPhoneLogin && styles.toggleTextActive]}>Email</Text>
          </TouchableOpacity>
        </View>

        {isPhoneLogin ? (
          <TextInput
            placeholder="Số điện thoại"
            style={styles.input}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        ) : (
          <TextInput
            placeholder="Email"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        )}

        <TextInput
          placeholder="Mật khẩu"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Đăng nhập</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>Hoặc đăng nhập với</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
            <Image
              source={require('../../assets/google-icon.png')}
              style={styles.socialIcon}
            />
            <Text style={styles.googleButtonText}>Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.facebookButton} onPress={handleFacebookLogin}>
            <Image
              source={require('../../assets/facebook-icon.png')}
              style={styles.socialIcon}
            />
            <Text style={styles.facebookButtonText}>Facebook</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Bạn chưa có tài khoản? Đăng ký</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={[styles.link, { marginTop: 8 }]}>Quên mật khẩu?</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 30,
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: colors.secondary,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    color: colors.primary,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: colors.secondary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: colors.accent,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    textAlign: 'center',
    color: colors.secondary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.primary,
  },
  dividerText: {
    marginHorizontal: 10,
    color: colors.primary,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  googleButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  facebookButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#1877F2',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  googleButtonText: {
    color: '#444',
    fontWeight: '600',
    fontSize: 14,
  },
  facebookButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  link: {
    color: colors.primary,
    textAlign: 'center',
    marginTop: 10,
  },
});