// app/screens/profile/ProfileScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../config/colors';
import api from '../../config/api';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    try {
      // 🔥 Lấy user từ storage
      const userData = await AsyncStorage.getItem('authUser');
      if (!userData) return;

      const userParsed = JSON.parse(userData);
      const userId = userParsed.id; // hoặc userParsed.userId tùy backend

      if (!userId) {
        console.log('Không có userId');
        return;
      }

      // 🔥 Lấy token
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.log('Không có token');
        return;
      }

      // 🔥 Gọi API
      const res = await fetch(api.AUTH_GET_USER(userId), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setUser(data.data);
      } else {
        console.log('API error:', data);
      }
    } catch (e) {
      console.log('Error fetchUser', e);
    }
  };

  // 🔥 Load lần đầu
  useEffect(() => {
    fetchUser();
  }, []);

  // 🔥 Khi quay lại màn hình
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUser();
    });

    return unsubscribe;
  }, [navigation]);

  const handleLogout = async () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('authUser');
          await AsyncStorage.removeItem('authToken');

          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  };

  const displayUser = user || {
    name: 'Khách hàng',
    phone: '---',
    email: '---',
  };

  return (
    <ScrollView style={styles.container}>
      {/* Thông tin cá nhân */}
      <View style={styles.headerBox}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {displayUser.name?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{displayUser.name}</Text>
          <Text style={styles.subText}>{displayUser.phone}</Text>
          <Text style={styles.subText}>{displayUser.email}</Text>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            navigation.navigate('EditProfile', {
              userId: user?.id, // 🔥 lấy từ user thật
            })
          }
        >
          <Text style={styles.editText}>Chỉnh sửa</Text>
        </TouchableOpacity>
      </View>

      {/* Menu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tài khoản</Text>
        <MenuItem
          label="Đơn hàng của tôi"
          onPress={() => navigation.navigate('OrderList')}
        />
        <MenuItem
          label="Sổ địa chỉ"
          onPress={() => navigation.navigate('AddressBook')}
        />
        <MenuItem
          label="Khuyến mãi của bạn"
          onPress={() => navigation.navigate('Promotion')}
        />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function MenuItem({ label, onPress }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuText}>{label}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.secondary },

  headerBox: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    margin: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },

  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },

  subText: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },

  editButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  editText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },

  section: {
    backgroundColor: 'white',
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingBottom: 6,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginVertical: 10,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },

  menuText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },

  menuArrow: {
    fontSize: 18,
    color: '#ccc',
  },

  logoutButton: {
    marginTop: 20,
    marginHorizontal: 12,
    marginBottom: 30,
    backgroundColor: '#fff3f3',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },

  logoutText: {
    color: '#d32f2f',
    fontWeight: 'bold',
    fontSize: 15,
  },
});