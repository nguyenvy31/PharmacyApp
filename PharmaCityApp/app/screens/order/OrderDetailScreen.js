// app/screens/order/OrderDetailScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ thêm
import colors from '../../config/colors';
import api from '../../config/api';
import StatusBadge from '../../components/admin/StatusBadge';

// map status đẹp hơn
const STATUS_CONFIG = {
  NEW: { label: 'Chờ xác nhận', color: '#ff9800' },
  SHIPPING: { label: 'Đang giao', color: '#1976d2' },
  COMPLETED: { label: 'Đã giao', color: '#4caf50' },
  CANCELED: { label: 'Đã hủy', color: '#f44336' },
  PAYMENT_FAILED: { label: 'Thanh toán thất bại', color: '#d32f2f' },
};

// ✅ PAYMENT STATUS
const PAYMENT_CONFIG = {
  UNPAID: { label: 'Chưa thanh toán', color: '#999' },
  PENDING: { label: 'Đang xử lý', color: '#ff9800' },
  PAID: { label: 'Đã thanh toán', color: '#4caf50' },
  FAILED: { label: 'Thanh toán thất bại', color: '#f44336' },
};

export default function OrderDetailScreen({ route }) {
  const { orderId } = route.params || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchOrderDetail = async () => {
    if (!orderId) return;

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('authToken');

      const res = await fetch(`${api.ORDERS}/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // ✅ QUAN TRỌNG
        },
      });

      const text = await res.text();
      console.log('RAW ORDER DETAIL:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.log('JSON parse error');
        setOrder(null);
        return;
      }

      // handle cả 2 kiểu backend
      if (data.success) {
        setOrder(data.data);
      } else {
        setOrder(data);
      }

    } catch (e) {
      console.log('Error fetchOrderDetail', e);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 8 }}>Đang tải chi tiết đơn hàng...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Không tìm thấy đơn hàng.</Text>
      </View>
    );
  }

  const {
    id,
    status,
    paymentStatus, // ✅ thêm
    totalAmount,
    createdAt,
    shippingAddress,
    receiverName,
    receiverPhone,
    note,
    items = [],
    shippingFee = 0,
    discountAmount = 0,
    promoCode,
  } = order;

  const statusCfg = STATUS_CONFIG[status] || {
    label: status,
    color: '#999',
  };

  const paymentCfg = PAYMENT_CONFIG[paymentStatus] || {
    label: paymentStatus,
    color: '#999',
  };

  const subtotal = items.reduce((sum, it) => {
    const qty = it.quantity ?? it.qty ?? 0;
    const price = it.unitPrice ?? it.price ?? 0;
    return sum + qty * price;
  }, 0);

  const handleCancelOrder = () => {
    Alert.alert(
      'Hủy đơn',
      'Bạn có chắc muốn hủy đơn này?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Xác nhận',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('authToken');
              const res = await fetch(
                api.CANCEL_ORDER(orderId),
                {
                  method: 'PUT',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (!res.ok) throw new Error();

              Alert.alert('Thành công', 'Đã hủy đơn');

              await fetchOrderDetail(); // reload

            } catch (err) {
              console.log(err);
              Alert.alert('Lỗi', 'Không thể hủy đơn');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Thông tin chung */}
      <View style={styles.box}>
        <Text style={styles.title}>
          Đơn hàng {order.code ? order.code : `#${id}`}
        </Text>
        {/* ✅ STATUS */}
        <View style={styles.row}>
          <Text>Trạng thái: </Text>
          <StatusBadge status={status} styles={styles} />
        </View>

        {/* ✅ PAYMENT STATUS */}
        <View style={styles.row}>
          <Text>Thanh toán: </Text>
          <View style={[styles.chip, { borderColor: paymentCfg.color }]}>
            <Text style={{ color: paymentCfg.color }}>
              {paymentCfg.label}
            </Text>
          </View>
        </View>

        <Text>Ngày đặt: {createdAt}</Text>
        {receiverName && <Text>Người nhận: {receiverName}</Text>}
        {receiverPhone && <Text>SĐT: {receiverPhone}</Text>}
      </View>

      {/* Địa chỉ */}
      <View style={styles.box}>
        <Text style={styles.title}>Địa chỉ giao hàng</Text>
        <Text>{shippingAddress}</Text>
        {note ? (
          <Text style={{ marginTop: 4, fontStyle: 'italic' }}>
            Ghi chú: {note}
          </Text>
        ) : null}
      </View>

      {/* Sản phẩm */}
      <View style={styles.box}>
        <Text style={styles.title}>Sản phẩm</Text>
        {items.map((it, index) => {
          const qty = it.quantity ?? it.qty ?? 0;
          const price = it.unitPrice ?? it.price ?? 0;
          const name = it.medicineName ?? it.name;

          return (
            <View key={index} style={styles.itemRow}>
              <Text style={{ flex: 1 }}>
                {qty} × {name}
              </Text>
              <Text>{(price * qty).toLocaleString('vi-VN')} đ</Text>
            </View>
          );
        })}
      </View>

      {/* Tổng tiền */}
      <View style={styles.box}>
        <View style={styles.summaryRow}>
          <Text>Tạm tính</Text>
          <Text>{subtotal.toLocaleString('vi-VN')} đ</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text>Phí vận chuyển</Text>
          <Text>{shippingFee.toLocaleString('vi-VN')} đ</Text>
        </View>

        {discountAmount > 0 && (
          <View style={styles.summaryRow}>
            <Text>Giảm giá ({promoCode})</Text>
            <Text style={{ color: 'green' }}>
              -{discountAmount.toLocaleString('vi-VN')} đ
            </Text>
          </View>
        )}

        <View style={styles.summaryRow}>
          <Text style={{ fontWeight: 'bold' }}>Tổng cộng</Text>
          <Text style={{ fontWeight: 'bold', color: colors.accent }}>
            {totalAmount.toLocaleString('vi-VN')} đ
          </Text>
        </View>

        {status === 'PENDING' && (
          <View style={styles.box}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleCancelOrder}
            >
              <Text style={styles.cancelText}>Hủy đơn</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.secondary },

  loadingContainer: {
    flex: 1,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  box: {
    backgroundColor: 'white',
    margin: 12,
    padding: 12,
    borderRadius: 10,
  },

  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: colors.primary,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  chip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },

  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },

   statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },

    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 6,
    },

    statusText: {
      fontSize: 11,
      fontWeight: '600',
    },

    cancelBtn: {
      backgroundColor: '#ffebee',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },

    cancelText: {
      color: '#c62828',
      fontWeight: '700',
    },
});