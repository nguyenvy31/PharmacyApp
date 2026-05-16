import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import colors from '../../config/colors';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const handleSendOtp = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert('Thông báo', 'Vui lòng nhập email.');
      return;
    }

    try {
      const res = await fetch('http://10.0.2.2:8080/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const data = await res.json();

      if (!data.success) {
        Alert.alert('Thông báo', data.message || 'Gửi OTP thất bại.');
        return;
      }

      Alert.alert('Thành công', data.message || 'Đã gửi OTP tới email.', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('ResetPassword', { email: trimmedEmail }),
        },
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert('Lỗi', 'Không kết nối được server.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quên mật khẩu</Text>
      <TextInput
        placeholder="Nhập email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
        <Text style={styles.buttonText}>Gửi OTP</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: colors.secondary },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: colors.primary },
  input: { borderWidth: 1, borderColor: colors.primary, borderRadius: 8, padding: 12, marginBottom: 20, backgroundColor: 'white' },
  button: { backgroundColor: colors.accent, padding: 15, borderRadius: 8 },
  buttonText: { textAlign: 'center', color: colors.secondary, fontWeight: 'bold', fontSize: 16 },
});
