import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import colors from '../../config/colors';
import StatusPill from '../../components/admin/StatusPill';
import adminApi from '../../config/adminApi';
import { authFetch } from '../../utils/authFetch';
import StatusBadge from '../../components/admin/StatusBadge';

export default function OrderDetailScreen({ route, navigation }) {
  const { orderId } = route.params || {};
  const [order, setOrder] = useState(null);

  const getStatusText = (status) => {
    const statusMap = {
      PENDING: 'Chờ xác nhận',
      PREPARING: 'Đang chuẩn bị',
      SHIPPING: 'Đang giao hàng',
      COMPLETED: 'Đã giao hàng',
      CANCELED: 'Đã hủy',
    };
    return statusMap[status] || status;
  };

  /* ================= FETCH ORDER DETAIL ================= */
  const fetchOrderDetail = async () => {
    try {
      const res = await authFetch(
        adminApi.ORDER_DETAIL(orderId),
        {},
        navigation
      );

      const data = await res.json();
      setOrder(data);

    } catch (err) {
      if (err.message !== 'UNAUTHORIZED') {
        console.error(err);
        Alert.alert('Lỗi', 'Không tải được chi tiết đơn hàng');
      }
    }
  };

  useEffect(() => {
    if (orderId) fetchOrderDetail();
  }, [orderId]);

  if (!order) {
    return (
      <View style={styles.loading}>
        <Text>Đang tải đơn hàng...</Text>
      </View>
    );
  }

  /* ================= ACTIONS ================= */
  const handleCallCustomer = () => {
    if (!order.customerPhone) return;
    Linking.openURL(`tel:${order.customerPhone}`);
  };

  const getNextStatus = (status) => {
    switch (status) {
      case 'PENDING':
        return 'PREPARING';
      case 'PREPARING':
        return 'SHIPPING';
      case 'SHIPPING':
        return 'COMPLETED';
      default:
        return null;
    }
  };

  const handleUpdateStatus = async () => {
    const nextStatus = getNextStatus(order.status);
    if (!nextStatus) return;

    Alert.alert(
      'Cập nhật trạng thái',
      `Chuyển đơn sang trạng thái ${getStatusText(nextStatus)}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
            await authFetch(
              `${adminApi.UPDATE_ORDER_STATUS(order.id)}?status=${nextStatus}`,
              {
                method: 'PUT',
              },
              navigation
            );

            await fetchOrderDetail();

            } catch (err) {
              console.error(err?.response?.data || err);
              Alert.alert('Lỗi', 'Cập nhật trạng thái thất bại');
            }
          },
        },
      ]
    );
  };


  const handleCancelOrder = () => {
    if (order.status === 'CANCELED') {
      Alert.alert('Thông báo', 'Đơn này đã bị hủy');
      return;
    }

    if (order.status === 'COMPLETED') {
      Alert.alert('Không thể hủy', 'Đơn đã hoàn thành');
      return;
    }

    Alert.alert(
      'Hủy đơn hàng',
      'Bạn có chắc chắn muốn hủy đơn này?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Xác nhận',
          style: 'destructive',
          onPress: async () => {
            try {
              await authFetch(
                `${adminApi.UPDATE_ORDER_STATUS(order.id)}?status=CANCELED`,
                {
                  method: 'PUT',
                },
                navigation
              );

              Alert.alert('Thành công', 'Đã hủy đơn hàng');

              await fetchOrderDetail(); // reload UI

            } catch (err) {
              console.error(err);
              Alert.alert('Lỗi', 'Hủy đơn thất bại');
            }
          },
        },
      ]
    );
  };

  const handlePrintInvoice = () => {
    Alert.alert('In hóa đơn', 'Chức năng này chưa có API');
  };

  const itemsTotal = order.items.reduce(
    (sum, it) => sum + it.unitPrice * it.qty,
    0
  );

  return (
    <ScrollView style={styles.container}>
      {/* ================= THÔNG TIN KHÁCH ================= */}
      <View style={styles.box}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>
            {order.code} · {order.createdAt}
          </Text>
          <StatusBadge status={order.status} styles={styles} />
        </View>

        <Text style={styles.label}>Khách hàng</Text>
        <Text style={styles.value}>
          {order.customerName} · {order.customerPhone}
        </Text>

        <Text style={styles.label}>Địa chỉ giao hàng</Text>
        <Text style={styles.value}>{order.shippingAddress}</Text>

        {order.note && (
          <>
            <Text style={styles.label}>Ghi chú</Text>
            <Text style={styles.value}>{order.note}</Text>
          </>
        )}
      </View>

      {/* ================= SẢN PHẨM ================= */}
      <View style={styles.box}>
        <Text style={styles.title}>Sản phẩm</Text>

        <View style={styles.tableHeader}>
          <Text style={[styles.th, { flex: 3 }]}>Tên sản phẩm</Text>
          <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>Đơn giá</Text>
          <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>SL</Text>
          <Text style={[styles.th, { flex: 1.2, textAlign: 'right' }]}>
            Thành tiền
          </Text>
        </View>

        {order.items.map((it) => (
          <View key={it.id} style={styles.tableRow}>
            <Text style={[styles.td, { flex: 3 }]}>{it.name}</Text>
            <Text style={[styles.td, { flex: 1, textAlign: 'right' }]}>
              {it.unitPrice.toLocaleString('vi-VN')}
            </Text>
            <Text style={[styles.td, { flex: 1, textAlign: 'right' }]}>
              {it.qty}
            </Text>
            <Text style={[styles.td, { flex: 1.2, textAlign: 'right' }]}>
              {(it.unitPrice * it.qty).toLocaleString('vi-VN')}
            </Text>
          </View>
        ))}
      </View>

      {/* ================= TỔNG KẾT ================= */}
      <View style={styles.box}>
        <Text style={styles.title}>Tổng kết</Text>
        <Row label="Tạm tính" value={itemsTotal} />
        <Row label="Phí ship" value={order.shippingFee} />
        {order.discount ? (
          <Row label="Giảm giá" value={-order.discount} />
        ) : null}
        <Row label="Tổng cộng" value={order.total} bold highlight />
      </View>

      {/* ================= ACTIONS ================= */}
      <View style={[styles.box, { flexDirection: 'row' }]}>
        <TouchableOpacity
          style={[styles.actionBtn, { flex: 1 }]}
          onPress={handleCallCustomer}
        >
          <Text style={styles.actionText}>Gọi cho khách</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.box, { flexDirection: 'row' }]}>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            { flex: 1, backgroundColor: colors.primary },
          ]}
          onPress={handleUpdateStatus}
        >
          <Text style={[styles.actionText, { color: 'white' }]}>
            Cập nhật trạng thái
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionBtn,
            { flex: 1, backgroundColor: '#ffebee', borderWidth: 0 },
          ]}
          onPress={handleCancelOrder}
        >
          <Text style={[styles.actionText, { color: '#c62828' }]}>
            Hủy đơn
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* ================= ROW COMPONENT ================= */
function Row({ label, value, bold, highlight }) {
  return (
    <View style={rowStyles.row}>
      <Text style={[rowStyles.label, bold && { fontWeight: '700' }]}>
        {label}
      </Text>
      <Text
        style={[
          rowStyles.value,
          bold && { fontWeight: '700' },
          highlight && { color: colors.accent },
        ]}
      >
        {value.toLocaleString('vi-VN')} đ
      </Text>
    </View>
  );
}

/* ================= STYLES (GIỮ NGUYÊN) ================= */
const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  label: { fontSize: 13, color: '#555' },
  value: { fontSize: 13, color: '#333' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.secondary },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  box: {
    backgroundColor: 'white',
    marginHorizontal: 12,
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontWeight: '700', fontSize: 15, marginBottom: 6 },
  label: { marginTop: 4, fontSize: 12, color: '#777' },
  value: { fontSize: 13, color: '#333' },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 4,
    marginTop: 4,
  },
  th: { fontSize: 12, fontWeight: '600', color: '#555' },
  tableRow: { flexDirection: 'row', paddingVertical: 4 },
  td: { fontSize: 12, color: '#333' },
  actionBtn: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionText: { fontSize: 13, fontWeight: '600', color: '#333' },

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
});
