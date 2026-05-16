import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import colors from '../../config/colors';
import api from '../../config/adminApi';
import { authFetch } from '../../utils/authFetch';

export default function AdminPromotionsScreen({ navigation }) {
  const [promotions, setPromotions] = useState([]);


  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const res = await authFetch(
        api.ADMIN_PROMOTIONS,
        {},
        navigation
      );

      const data = await res.json();
      setPromotions(data || []);

    } catch (e) {
      if (e.message !== 'UNAUTHORIZED') {
        console.log(e);
      }
    }
  };


  const deletePromotion = (id) => {
    Alert.alert('Xác nhận', 'Xóa khuyến mãi này?', [
      { text: 'Hủy' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await authFetch(
              api.ADMIN_DELETE_PROMOTION(id),
              { method: 'DELETE' },
              navigation
            );

            if (!res.ok) {
              const msg = await res.text();
              Alert.alert('Lỗi', msg || 'Xóa thất bại');
              return;
            }

            Alert.alert('Thành công', 'Đã xóa khuyến mãi');
            loadData();

          } catch (e) {
            console.log(e);
          }
        },
      },
    ]);
  };
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('AdminPromotionForm', { promotion: item })
      }
    >
      <View style={styles.row}>
        <Text style={styles.code}>{item.code}</Text>
        <Text style={{ color: item.active ? 'green' : 'red' }}>
          {item.active ? 'Đang bật' : 'Tắt'}
        </Text>
      </View>

      <Text style={styles.text}>
        {item.type === 'PERCENT'
          ? `Giảm ${item.value}% (tối đa ${item.maxDiscount?.toLocaleString() || 0} đ)`
          : `Giảm ${item.value.toLocaleString()} đ`}
      </Text>

      <Text style={styles.text}>
        Đơn tối thiểu: {item.minOrderValue.toLocaleString()} đ
      </Text>

      <Text style={styles.text}>
        Lượt dùng: {item.used}/{item.quantity}
      </Text>

      <Text style={styles.text}>
        Hết hạn: {item.expireAt?.replace('T', ' ')}
      </Text>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => deletePromotion(item.id)}
      >
        <Text style={{ color: 'white' }}>Xóa</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={promotions}
        keyExtractor={(i) => i.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12 }}
      />

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate('AdminPromotionForm')}
      >
        <Text style={styles.addText}>＋ Thêm khuyến mãi</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.secondary },
  card: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  code: { fontWeight: '700', fontSize: 14 },
  text: { fontSize: 13, marginTop: 4 },
  deleteBtn: {
    marginTop: 8,
    backgroundColor: '#e53935',
    padding: 6,
    borderRadius: 6,
    alignSelf: 'flex-end',
  },
  addBtn: {
    backgroundColor: colors.primary,
    padding: 14,
    alignItems: 'center',
  },
  addText: { color: 'white', fontWeight: '700' },
});
