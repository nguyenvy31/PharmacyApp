import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import colors from '../../config/colors';
import api from '../../config/adminApi';
import { authFetch } from '../../utils/authFetch';
import { useFocusEffect } from '@react-navigation/native';

export default function CustomersScreen({ navigation }) {
  const [q, setQ] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await authFetch(
        api.ADMIN_CUSTOMERS,
        {},
        navigation
      );

      const data = await res.json();
      setCustomers(data || []);

    } catch (e) {
      if (e.message !== 'UNAUTHORIZED') {
        console.log('Fetch customers error', e);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ auto reload khi quay lại
  useFocusEffect(
    useCallback(() => {
      fetchCustomers();
    }, [])
  );

  const filtered = customers.filter(c => {
    const kw = q.trim().toLowerCase();
    if (!kw) return true;
    return (
      c.name?.toLowerCase().includes(kw) ||
      c.phone?.includes(kw)
    );
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.secondary }}>

      {/* Search */}
      <View style={{ padding: 12, backgroundColor: 'white' }}>
        <TextInput
          placeholder="Tìm theo tên hoặc SĐT"
          value={q}
          onChangeText={setQ}
          style={{
            backgroundColor: '#f5f5f5',
            borderRadius: 8,
            padding: 8,
          }}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(it) => String(it.id)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate('CustomerDetail', {
                  customerId: item.id,
                })
              }
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700' }}>
                  {item.name}
                </Text>
                <Text style={{ color: '#666' }}>
                  {item.phone}
                </Text>
                <Text style={{ color: '#666', fontSize: 12 }}>
                  Đơn: {item.orders} · Chi tiêu:{' '}
                  {item.spent?.toLocaleString('vi-VN')} đ
                </Text>
              </View>

              <Text style={{ color: '#999', fontSize: 12 }}>
                {item.joined}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    margin: 12,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
});