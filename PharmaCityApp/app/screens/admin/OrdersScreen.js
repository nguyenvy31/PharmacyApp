import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import adminApi from '../../config/adminApi';
import { authFetch } from '../../utils/authFetch';
import styles from './OrdersScreen.styles';
import StatusBadge from '../../components/admin/StatusBadge';

const TABS = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ xác nhận' },
  { key: 'PREPARING', label: 'Đang chuẩn bị' },
  { key: 'SHIPPING', label: 'Đang giao' },
  { key: 'COMPLETED', label: 'Đã giao' },
  { key: 'CANCELED', label: 'Đã hủy' },
];


export default function OrdersScreen({ navigation }) {
  const [statusTab, setStatusTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = [];

      if (statusTab !== 'ALL') {
        params.push(`status=${statusTab}`);
      }

      if (search.trim()) {
        params.push(`search=${search.trim()}`);
      }

      const query = params.length ? `?${params.join('&')}` : '';

      const res = await authFetch(
        `${adminApi.ORDERS}${query}`,
        {},
        navigation
      );

      const data = await res.json();
      setOrders(data || []);

    } catch (err) {
      if (err.message !== 'UNAUTHORIZED') {
        console.error(err);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusTab, search]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const nextActionLabel = (status) => {
    switch (status) {
      case 'PENDING': return 'Xác nhận đơn';
      case 'PREPARING': return 'Đã đóng gói';
      case 'SHIPPING': return 'Xác nhận đã giao';
      default: return 'Cập nhật';
    }
  };

  const handleQuickUpdate = async (order) => {
    let newStatus;
    switch (order.status) {
      case 'PENDING': newStatus = 'PREPARING'; break;
      case 'PREPARING': newStatus = 'SHIPPING'; break;
      case 'SHIPPING': newStatus = 'COMPLETED'; break;
      default: return;
    }

    try {
      await authFetch(
        `${adminApi.UPDATE_ORDER_STATUS(order.id)}?status=${newStatus}`,
        {
          method: 'PUT',
        },
        navigation
      );
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <View style={styles.container}>
      {/* TABS */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[
                styles.tabItem,
                statusTab === t.key && styles.tabItemActive
              ]}
              onPress={() => setStatusTab(t.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  statusTab === t.key && styles.tabTextActive
                ]}
              >
                {t.label}
              </Text>
              {statusTab === t.key && <View style={styles.tabActiveIndicator} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* SEARCH */}
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo mã đơn, tên khách hàng, số điện thoại..."
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ORDERS LIST */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196f3" />
          <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2196f3']} />
          }
        >
          {orders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>Không tìm thấy đơn hàng nào</Text>
              <Text style={styles.emptySubText}>Hãy thử tìm kiếm với từ khóa khác</Text>
            </View>
          ) : (
            orders.map((o) => (
              <View key={o.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderCode}>{o.code}</Text>
                    <Text style={styles.orderDate}>{formatDate(o.createdAt)}</Text>
                  </View>
                  <StatusBadge status={o.status} styles={styles} />
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.customerInfo}>
                    <Text style={styles.customerIcon}>👤</Text>
                    <Text style={styles.textCustomer}>
                      {o.customer ?? 'Khách vãng lai'}
                    </Text>
                    {o.phone && (
                      <>
                        <Text style={styles.dot}>•</Text>
                        <Text style={styles.phoneIcon}>📞</Text>
                        <Text style={styles.textPhone}>{o.phone}</Text>
                      </>
                    )}
                  </View>

                  <View style={styles.itemsWrapper}>
                    <Text style={styles.itemsTitle}>📦 Sản phẩm đã đặt:</Text>
                    {o.items?.slice(0, 3).map((it, idx) => (
                      <View key={idx} style={styles.itemRow}>
                        <Text style={styles.itemName} numberOfLines={1}>
                          {it.name}
                        </Text>
                        <Text style={styles.itemQty}>x{it.qty}</Text>
                      </View>
                    ))}
                    {o.items?.length > 3 && (
                      <Text style={styles.textItemMore}>
                        + {o.items.length - 3} sản phẩm khác
                      </Text>
                    )}
                  </View>

                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>💰 Tổng tiền</Text>
                    <Text style={styles.totalText}>
                      {o.total.toLocaleString('vi-VN')} đ
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => navigation.navigate('AdminOrderDetail', { orderId: o.id })}
                  >
                    <Text style={styles.secondaryBtnText}>👁️ Chi tiết</Text>
                  </TouchableOpacity>

                  {(o.status !== 'COMPLETED' && o.status !== 'CANCELED') && (
                    <TouchableOpacity
                      style={styles.primaryBtn}
                      onPress={() => handleQuickUpdate(o)}
                    >
                      <Text style={styles.primaryBtnText}>
                        {nextActionLabel(o.status)}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}
    </View>
  );
}