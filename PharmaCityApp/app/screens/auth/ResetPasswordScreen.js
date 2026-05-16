import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import colors from '../../config/colors';

export default function ResetPasswordScreen({ navigation, route }) {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const email = route?.params?.email;

  const handleReset = async () => {
    const trimmedOtp = otp.trim();
    const trimmedNewPass = newPassword.trim();
    const trimmedConfirm = confirm.trim();

    if (!email) {
      Alert.alert('Lỗi', 'Không có thông tin email.');
      return;
    }

    if (!trimmedOtp || !trimmedNewPass || !trimmedConfirm) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ OTP và mật khẩu mới.');
      return;
    }

    if (trimmedNewPass.length < 6) {
      Alert.alert('Thông báo', 'Mật khẩu mới phải tối thiểu 6 ký tự.');
      return;
    }

    if (trimmedNewPass !== trimmedConfirm) {
      Alert.alert('Thông báo', 'Mật khẩu mới và xác nhận không trùng khớp.');
      return;
    }

    try {
      const res = await fetch('http://10.0.2.2:8080/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp: trimmedOtp,
          newPassword: trimmedNewPass,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        Alert.alert('Thông báo', data.message || 'Đặt lại mật khẩu thất bại.');
        return;
      }

      Alert.alert('Thành công', 'Đặt lại mật khẩu thành công, hãy đăng nhập lại.', [
        {
          text: 'OK',
          onPress: () => navigation.replace('Login'),
        },
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert('Lỗi', 'Không kết nối được server.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đặt lại mật khẩu</Text>
      <Text style={styles.subTitle}>Email: {email}</Text>

      <TextInput
        placeholder="Mã OTP"
        style={styles.input}
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
        maxLength={6}
      />
      <TextInput
        placeholder="Mật khẩu mới"
        style={styles.input}
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        placeholder="Xác nhận mật khẩu mới"
        style={styles.input}
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
      />

      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>Xác nhận</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: colors.secondary },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: colors.primary },
  subTitle: { textAlign: 'center', marginBottom: 20, color: colors.primary },
  input: { borderWidth: 1, borderColor: colors.primary, borderRadius: 8, padding: 12, marginBottom: 15, backgroundColor: 'white' },
  button: { backgroundColor: colors.accent, padding: 15, borderRadius: 8 },
  buttonText: { textAlign: 'center', color: colors.secondary, fontWeight: 'bold', fontSize: 16 },
});
