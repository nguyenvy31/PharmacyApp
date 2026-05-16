import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import colors from '../../config/colors';

export default function OTPScreen({ navigation, route }) {
  const [otp, setOtp] = useState('');
  const email = route?.params?.email; // ✔ lấy email từ RegisterScreen

  const handleConfirm = async () => {
    const trimmedOtp = otp.trim();

    if (trimmedOtp.length !== 6) {
      Alert.alert('Thông báo', 'Mã OTP phải gồm 6 số.');
      return;
    }

    try {
      const response = await fetch('http://10.0.2.2:8080/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,     // ✔ gửi email thay vì phone
          otp: trimmedOtp,  // ✔ gửi OTP nhập vào
        }),
      });

      const data = await response.json();

      if (!data.success) {
        Alert.alert('Thông báo', data.message || 'Xác thực OTP thất bại.');
        return;
      }

      Alert.alert('Thành công', 'Xác nhận OTP thành công!', [
        {
          text: 'OK',
          onPress: () => navigation.replace('MainTabs'),
        },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không kết nối được server.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nhập mã OTP</Text>

      {email ? (
        <Text style={styles.subTitle}>Mã OTP đã được gửi tới email: {email}</Text>
      ) : null}

      <TextInput
        placeholder="Mã OTP"
        style={styles.input}
        keyboardType="numeric"
        value={otp}
        onChangeText={setOtp}
        maxLength={6}
      />

      <TouchableOpacity style={styles.button} onPress={handleConfirm}>
        <Text style={styles.buttonText}>Xác nhận</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ marginTop: 10 }}
        onPress={async () => {
          try {
            const res = await fetch('http://10.0.2.2:8080/api/v1/auth/resend-otp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email }),
            });
            const data = await res.json();
            Alert.alert('Thông báo', data.message || 'Đã gửi lại OTP (nếu email tồn tại).');
          } catch (e) {
            Alert.alert('Lỗi', 'Không kết nối được server.');
          }
        }}
      >
        <Text style={{ textAlign: 'center', color: colors.primary, marginTop: 8 }}>
          Gửi lại mã OTP
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: colors.secondary },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.primary, marginBottom: 10, textAlign: 'center' },
  subTitle: { fontSize: 14, color: colors.primary, marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 20,
    backgroundColor: 'white',
  },
  button: { backgroundColor: colors.accent, padding: 15, borderRadius: 8 },
  buttonText: { textAlign: 'center', color: colors.secondary, fontWeight: 'bold', fontSize: 16 },
});
