// app/screens/order/OrderListScreen.js
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ thêm
import api from '../../config/api';
import colors from '../../config/colors';

// Map tab → status trong DB
const TABS = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ xác nhận' },
  { key: 'SHIPPING', label: 'Đang giao' },
  { key: 'COMPLETED', label: 'Đã giao' },
  { key: 'CANCELED', label: 'Đã hủy' },
];

const STATUS_CONFIG = {
  PENDING: { label: 'Chờ xác nhận', color: '#ff9800' },
  SHIPPING: { label: 'Đang giao', color: '#1976d2' },
  COMPLETED: { label: 'Đã giao', color: '#4caf50' },
  CANCELED: { label: 'Đã hủy', color: '#f44336' },
};

export default function OrderListScreen({ navigation }) {
  const [userId, setUserId] = useState(null); // ✅ FIX
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');

  // ================= LOAD USER =================
  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await AsyncStorage.getItem('authUser');
        if (!data) return;

        const parsed = JSON.parse(data);
        setUserId(parsed.id); // ✅ giống AddressScreen
      } catch (e) {
        console.log('Load user error', e);
      }
    };

    loadUser();
  }, []);

  // ================= FETCH ORDERS =================
  const fetchOrders = async (uid) => {
    try {
      const token = await AsyncStorage.getItem('authToken'); // ✅ thêm token

      const res = await fetch(`${api.ORDERS}?userId=${uid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // ✅ QUAN TRỌNG
        },
      });

      const text = await res.text();
      console.log('RAW ORDERS:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.log('Parse JSON error');
        return;
      }

      // handle cả 2 kiểu backend
      if (Array.isArray(data)) {
        setOrders(data);
      } else if (data.success) {
        setOrders(data.data || []);
      } else {
        console.log('API ERROR:', data);
      }

    } catch (e) {
      console.log('Error fetchOrders', e);
    }
  };

  // load lần đầu
  useEffect(() => {
    if (userId) {
      fetchOrders(userId);
    }
  }, [userId]);

  // reload khi quay lại màn
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (userId) fetchOrders(userId);
    });

    return unsubscribe;
  }, [navigation, userId]);

  // ================= FILTER =================
  const filteredOrders = useMemo(() => {
    if (activeTab === 'ALL') return orders;
    return orders.filter((o) => o.status === activeTab);
  }, [orders, activeTab]);

  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleString('vi-VN');
    } catch {
      return isoString;
    }
  };

  const renderItem = ({ item }) => {
    const statusCfg = STATUS_CONFIG[item.status] || {
      label: item.status,
      color: '#999',
    };

    const total = item.totalAmount ?? 0;
    const products = item.items || [];

    const previewItems = products.slice(0, 3);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('OrderDetail', { orderId: item.id })
        }
        activeOpacity={0.85}
      >
        {/* HEADER */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderCode}>
              {item.code ? item.code : `#${item.id}`}
            </Text>
            <Text style={styles.orderDate}>
              {formatDateTime(item.createdAt)}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusCfg.color + '20' },
            ]}
          >
            <Text style={[styles.statusText, { color: statusCfg.color }]}>
              {statusCfg.label}
            </Text>
          </View>
        </View>

        {/* BODY */}
        <View style={styles.cardBody}>
          <View style={styles.itemsWrapper}>
            <Text style={styles.itemsTitle}>📦 Sản phẩm:</Text>

            {previewItems.map((p, idx) => (
              <View key={idx} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {p.name}
                </Text>
                <Text style={styles.itemQty}>x{p.quantity}</Text>
              </View>
            ))}

            {products.length > 3 && (
              <Text style={styles.moreText}>
                + {products.length - 3} sản phẩm khác
              </Text>
            )}
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>💰 Tổng tiền</Text>
            <Text style={styles.totalValue}>
              {total.toLocaleString('vi-VN')} đ
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ACTION */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() =>
              navigation.navigate('OrderDetail', { orderId: item.id })
            }
          >
            <Text style={styles.secondaryText}>👁️ Chi tiết</Text>
          </TouchableOpacity>

          {item.status === 'SHIPPING' && (
            <TouchableOpacity style={styles.primaryBtn}>
              <Text style={styles.primaryText}>Theo dõi</Text>
            </TouchableOpacity>
          )}

          {item.status === 'COMPLETED' && (
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: '#4caf50' }]}
            >
              <Text style={styles.primaryText}>Mua lại</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        <FlatList
          horizontal
          data={TABS}
          keyExtractor={(t) => t.key}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const active = item.key === activeTab;
            return (
              <TouchableOpacity
                style={[styles.tabItem, active && styles.tabItemActive]}
                onPress={() => setActiveTab(item.key)}
              >
                <Text
                  style={[styles.tabText, active && styles.tabTextActive]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={renderItem}
        keyExtractor={(it) => it.id.toString()}
        contentContainerStyle={{ paddingBottom: 16 }}
        ListEmptyComponent={
          <View style={{ marginTop: 40, alignItems: 'center' }}>
            <Text>Chưa có đơn hàng nào.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  // TABS
  tabRow: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  tabItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  tabItemActive: {
    backgroundColor: '#e3f2fd',
  },
  tabText: {
    fontSize: 13,
    color: '#666',
  },
  tabTextActive: {
    color: '#2196f3',
    fontWeight: '600',
  },

  // CARD
  card: {
    backgroundColor: 'white',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  orderCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },

  // STATUS
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // BODY
  cardBody: {
    padding: 16,
  },

  itemsWrapper: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },

  itemsTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    color: '#666',
  },

  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  itemName: {
    flex: 1,
    fontSize: 13,
    color: '#555',
  },

  itemQty: {
    fontWeight: '600',
    color: '#2196f3',
  },

  moreText: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    fontStyle: 'italic',
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },

  totalLabel: {
    fontSize: 14,
    color: '#666',
  },

  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e53935',
  },

  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },

  // ACTIONS
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
    gap: 10,
  },

  secondaryBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },

  secondaryText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '600',
  },

  primaryBtn: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },

  primaryText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
});