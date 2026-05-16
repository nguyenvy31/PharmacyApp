import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import colors from '../../config/colors';
import api from '../../config/adminApi';
import { authFetch } from '../../utils/authFetch';
import { useFocusEffect } from '@react-navigation/native';

export default function CustomerDetailScreen({ route, navigation }) {
  const { customerId } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await authFetch(
        api.ADMIN_CUSTOMER_DETAIL(customerId),
        {},
        navigation
      );

      const json = await res.json();
      setData(json);

    } catch (e) {
      if (e.message !== 'UNAUTHORIZED') {
        console.log(e);
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDetail();
    }, [customerId])
  );

  if (loading || !data) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <View style={styles.card}>
        <Text style={styles.name}>{data.name}</Text>
        <Text style={styles.phone}>{data.phone}</Text>
        <Text style={styles.email}>{data.email}</Text>

        <View
          style={[
            styles.badge,
            { backgroundColor: data.verified ? '#4CAF50' : '#9E9E9E' },
          ]}
        >
          <Text style={{ color: '#fff' }}>
            {data.verified ? 'Đã xác thực' : 'Chưa xác thực'}
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{data.orders}</Text>
          <Text style={styles.statLabel}>Đơn hàng</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {data.spent?.toLocaleString('vi-VN')} đ
          </Text>
          <Text style={styles.statLabel}>Chi tiêu</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>
          Tham gia:{' '}
          {data.joined
            ? new Date(data.joined).toLocaleDateString('vi-VN')
            : ''}
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },

  name: { fontSize: 20, fontWeight: '700' },
  phone: { color: '#666', marginTop: 4 },
  email: { color: '#666', marginTop: 2 },

  badge: {
    marginTop: 10,
    padding: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },

  stats: {
    flexDirection: 'row',
    marginHorizontal: 16,
  },

  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 6,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },

  statLabel: {
    fontSize: 12,
    color: '#666',
  },

  info: { margin: 16 },
  infoText: { color: '#555' },
});