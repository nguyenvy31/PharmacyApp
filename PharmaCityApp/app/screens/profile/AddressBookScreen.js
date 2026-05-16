// app/screens/profile/AddressBookScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../config/colors';
import api from '../../config/api';

export default function AddressBookScreen({ navigation }) {
  const [userId, setUserId] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= LOAD USER =================
  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await AsyncStorage.getItem('authUser');
        if (!data) return;

        const parsed = JSON.parse(data);
        console.log('USER:', parsed);

        setUserId(parsed.id);
      } catch (e) {
        console.log('Load user error', e);
      }
    };

    loadUser();
  }, []);

  // ================= FETCH ADDRESS =================
  const fetchAddresses = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('authToken');

      console.log('CALL API:', `${api.ADDRESSES}?userId=${userId}`);
      console.log('TOKEN:', token);

      const res = await fetch(`${api.ADDRESSES}?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // 🔥 FIX QUAN TRỌNG
        },
      });

      console.log('STATUS:', res.status);

      const text = await res.text();
      console.log('RAW RESPONSE:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.log('JSON parse error');
        return;
      }

      // nếu backend trả List trực tiếp
      if (Array.isArray(data)) {
        setAddresses(data);
      } else if (data.success) {
        setAddresses(data.data || []);
      } else {
        console.log('API ERROR:', data);
      }

    } catch (e) {
      console.log('Fetch address error', e);
      Alert.alert('Lỗi', 'Không kết nối server');
    } finally {
      setLoading(false);
    }
  };

  // load lần đầu
  useEffect(() => {
    if (userId) {
      fetchAddresses();
    }
  }, [userId]);

  // reload khi quay lại
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchAddresses();
    });

    return unsubscribe;
  }, [navigation, userId]);

  // ================= DELETE =================
  const handleDelete = (id) => {
    Alert.alert('Xoá', 'Bạn chắc chắn?', [
      { text: 'Hủy' },
      {
        text: 'Xoá',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('authToken');

            await fetch(`${api.ADDRESSES}/${id}?userId=${userId}`, {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`, // 🔥 FIX
              },
            });

            fetchAddresses();
          } catch (e) {
            console.log(e);
          }
        },
      },
    ]);
  };

  // ================= RENDER =================
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>
        {item.fullname} {item.default ? '(Mặc định)' : ''}
      </Text>
      <Text>{item.phone}</Text>
      <Text>{item.address}</Text>

      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => navigation.navigate('EditAddress', { address: item })}
        >
          <Text style={styles.link}>Sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Text style={[styles.link, { color: 'red' }]}>Xoá</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ================= UI =================
  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(i) => i.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 20 }}>
              Không có địa chỉ nào
            </Text>
          }
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('EditAddress')}
      >
        <Text style={styles.addText}>+ Thêm địa chỉ</Text>
      </TouchableOpacity>
    </View>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.secondary },

  card: {
    backgroundColor: 'white',
    margin: 10,
    padding: 12,
    borderRadius: 10,
  },

  name: { fontWeight: 'bold', fontSize: 15 },

  row: { flexDirection: 'row', marginTop: 8 },

  link: { marginRight: 10, color: colors.primary },

  addButton: {
    margin: 10,
    backgroundColor: colors.accent,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
  },

  addText: { color: 'white', fontWeight: 'bold' },
});