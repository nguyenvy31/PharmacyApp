import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import colors from '../../config/colors';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');      // 👈 thêm email
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);

  const validateEmail = (value) => {
    // Regex đơn giản, đủ dùng cho validate cơ bản
    const re = /\S+@\S+\.\S+/;
    return re.test(value);
  };

  const handleRegister = async () => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirm = confirm.trim();

    if (!trimmedName || !trimmedPhone || !trimmedEmail || !trimmedPassword || !trimmedConfirm) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ tất cả các thông tin.');
      return;
    }

    if (trimmedPhone.length < 9) {
      Alert.alert('Thông báo', 'Số điện thoại không hợp lệ.');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      Alert.alert('Thông báo', 'Email không hợp lệ.');
      return;
    }

    if (trimmedPassword.length < 6) {
      Alert.alert('Thông báo', 'Mật khẩu phải tối thiểu 6 ký tự.');
      return;
    }

    if (trimmedPassword !== trimmedConfirm) {
      Alert.alert('Thông báo', 'Mật khẩu và xác nhận mật khẩu không trùng khớp.');
      return;
    }

    if (!agree) {
      Alert.alert('Thông báo', 'Bạn cần đồng ý với Điều khoản & Điều kiện để tiếp tục.');
      return;
    }

    // 🔥 Gọi API đăng ký tới backend
    try {
      // ⚠️ Lưu ý: nếu chạy trên Android emulator:
      // - Backend localhost trên máy: dùng http://10.0.2.2:8080
      // Nếu chạy trên device thật: dùng IP LAN của máy (vd: http://192.168.1.5:8080)
      const response = await fetch('http://10.0.2.2:8080/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
          phone: trimmedPhone,
          email: trimmedEmail,
          password: trimmedPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        Alert.alert('Thông báo', data.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        return;
      }

      // Đăng ký thành công → Backend đã gửi mã kích hoạt qua email
      Alert.alert('Thành công', data.message || 'Đăng ký thành công, vui lòng kiểm tra email để lấy mã OTP.');

      // Điều hướng sang màn hình OTP, bạn có thể tạo OTPScreen nhập mã lấy từ email
      navigation.navigate('OTPScreen', {
        email: trimmedEmail,
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không kết nối được tới server. Vui lòng kiểm tra lại.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng ký</Text>

      <TextInput
        placeholder="Họ và tên"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder="Số điện thoại"
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Mật khẩu"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        placeholder="Xác nhận mật khẩu"
        style={styles.input}
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
      />

      <View style={styles.checkboxContainer}>
        <CheckBox value={agree} onValueChange={setAgree} />
        <Text>Tôi đồng ý với Điều khoản & Điều kiện</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Đăng ký</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: colors.secondary },
  title: { fontSize: 32, fontWeight: 'bold', color: colors.primary, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: colors.primary, borderRadius: 8, padding: 12, marginBottom: 15, backgroundColor: 'white' },
  button: { backgroundColor: colors.accent, padding: 15, borderRadius: 8, marginTop: 10 },
  buttonText: { textAlign: 'center', color: colors.secondary, fontWeight: 'bold', fontSize: 16 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
});
