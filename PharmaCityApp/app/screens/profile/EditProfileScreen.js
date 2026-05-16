import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../config/colors';
import api from '../../config/api';

const emailRegex = /\S+@\S+\.\S+/;

export default function EditProfileScreen({ route, navigation }) {
  const { userId } = route.params || {};

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ================= FETCH USER =================
  useEffect(() => {
    if (!userId) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập lại.', [
        { text: 'OK', onPress: () => navigation.replace('Login') },
      ]);
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);

        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          Alert.alert('Lỗi', 'Không tìm thấy token');
          return;
        }

        const res = await fetch(api.AUTH_GET_USER(userId), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();

        if (json.success && json.data) {
          const u = json.data;
          setName(u.name || '');
          setPhone(u.phone || '');
          setEmail(u.email || '');
        } else {
          Alert.alert('Lỗi', json.message || 'Không lấy được thông tin.');
        }
      } catch (e) {
        console.log('Error fetch user', e);
        Alert.alert('Lỗi', 'Không kết nối được server.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  // ================= SAVE =================
  const handleSave = async () => {
    const n = name.trim();
    const p = phone.trim();
    const e = email.trim();

    if (!n) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ tên.');
      return;
    }
    if (!p || p.length < 9) {
      Alert.alert('Thông báo', 'Số điện thoại không hợp lệ.');
      return;
    }
    if (!e || !emailRegex.test(e)) {
      Alert.alert('Thông báo', 'Email không hợp lệ.');
      return;
    }

    try {
      setSaving(true);

      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Lỗi', 'Không tìm thấy token');
        return;
      }

      const res = await fetch(api.AUTH_UPDATE_USER(userId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // ✅ chuẩn JWT
        },
        body: JSON.stringify({
          name: n,
          phone: p,
          email: e,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        Alert.alert('Lỗi', json.message || 'Cập nhật thất bại.');
        return;
      }

      // ✅ Update lại local storage
      await AsyncStorage.setItem(
        'authUser',
        JSON.stringify({
          id: userId,
          name: n,
          phone: p,
          email: e,
        })
      );

      // ✅ Quay lại luôn (fix lỗi không back)
      navigation.goBack();

    } catch (e) {
      console.log('Error update user', e);
      Alert.alert('Lỗi', 'Không kết nối được server.');
    } finally {
      setSaving(false);
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 8 }}>Đang tải thông tin...</Text>
      </View>
    );
  }

  // ================= UI =================
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chỉnh sửa tài khoản</Text>

      <Text style={styles.label}>Họ và tên</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Họ và tên"
      />

      <Text style={styles.label}>Số điện thoại</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="Số điện thoại"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="Email"
      />

      <TouchableOpacity
        style={[styles.saveButton, saving && { opacity: 0.7 }]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveText}>
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
    padding: 16,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    color: '#555',
    marginTop: 10,
    marginBottom: 4,
  },

  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  saveButton: {
    marginTop: 24,
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },

  saveText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});