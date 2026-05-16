import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import colors from '../../config/colors';
import StatCard from '../../components/admin/StatCard';
import StatusPill from '../../components/admin/StatusPill';
import api from '../../config/adminApi';
import { authFetch } from '../../utils/authFetch';
import StatusBadge from '../../components/admin/StatusBadge';
import { useFocusEffect } from '@react-navigation/native';



/* ================= COMPONENT NÚT CÓ ANIMATION RIÊNG ================= */
const AnimatedButton = ({ icon, text, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start(() => {
      onPress && onPress();
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={styles.quickItem}
      onPressIn={pressIn}
      onPressOut={pressOut}
    >
      <Animated.View
        style={[
          styles.quickBtn,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={styles.quickIcon}>{icon}</Text>
        <Text style={styles.quickText} numberOfLines={1}>{text}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

/* ================= DASHBOARD ================= */
export default function DashboardScreen({ navigation }) {
  const [stats, setStats] = useState({
    todayRevenue: 0,
    newOrders: 0,
    lowStockProducts: 0,
    newCustomers: 0,
  });

  const [chartData, setChartData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

  // Hàm fetch dữ liệu
  const fetchDashboard = async () => {
    try {
      const [resStats, resChart, resRecent] = await Promise.all([
        authFetch(api.DASHBOARD, {}, navigation),
        authFetch(api.DASHBOARD_REVENUE_7_DAYS, {}, navigation),
        authFetch(api.DASHBOARD_RECENT_ORDERS, {}, navigation),
      ]);

      const statsData = await resStats.json();
      const chart = await resChart.json();
      const recent = await resRecent.json();

      setStats({
        todayRevenue: statsData.todayRevenue || 0,
        newOrders: statsData.newOrders || 0,
        lowStockProducts: statsData.lowStockProducts || 0,
        newCustomers: statsData.newCustomers || 0,
      });

      setChartData(chart || []);
      setRecentOrders(recent || []);
    } catch (error) {
      if (error.message !== 'UNAUTHORIZED') {
        console.log('Error fetching dashboard:', error);
      }
    }
  };

  // Sử dụng useFocusEffect để reload mỗi khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [])
  );

  const maxRevenue = chartData.reduce(
    (max, d) => (d.revenue > max ? d.revenue : max),
    1
  );

  return (
    <ScrollView style={styles.container}>

      {/* HEADER: TỔNG QUAN & ICON 3 GẠCH */}
      <View style={styles.headerContainer}>
        <Text style={styles.pageTitle}>Tổng quan</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
          style={styles.menuIconBtn}
        >
          {/* Bạn có thể thay ký tự ☰ này bằng Icon từ thư viện nếu muốn */}
          <Text style={styles.hamburgerIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* MENU QUẢN LÝ NHANH - Xổ xuống khi bấm icon 3 gạch */}
      {isQuickMenuOpen && (
        <View style={[styles.box, styles.menuDropdown]}>
          <View style={styles.quickGrid}>
            <AnimatedButton icon="📦" text="Đơn hàng" onPress={() => navigation.navigate('AdminOrders')} />
            <AnimatedButton icon="💊" text="Sản phẩm" onPress={() => navigation.navigate('AdminProducts')} />
            <AnimatedButton icon="🏷️" text="Loại thuốc" onPress={() => navigation.navigate('AdminCategory')} />
            <AnimatedButton icon="🏬" text="Kho" onPress={() => navigation.navigate('AdminInventory')} />
            <AnimatedButton icon="👥" text="Khách" onPress={() => navigation.navigate('AdminCustomers')} />
            <AnimatedButton icon="🎁" text="Khuyến mãi" onPress={() => navigation.navigate('AdminPromotions')} />
            <AnimatedButton icon="🧾" text="Thống kê" onPress={() => navigation.navigate('RevenueStats')} />
            <AnimatedButton icon="⚙️" text="Cài đặt" onPress={() => navigation.navigate('AdminSettings')} />
          </View>
        </View>
      )}

      {/* THỐNG KÊ */}
      <View style={styles.row}>
        <StatCard
          label="Doanh thu hôm nay"
          value={stats.todayRevenue.toLocaleString('vi-VN') + ' đ'}
          color={colors.accent}
        />
        <StatCard
          label="Đơn hàng mới"
          value={stats.newOrders}
          subLabel="Cần xử lý"
          color="#42a5f5"
        />
      </View>

      <View style={styles.row}>
        <StatCard
          label="SP sắp hết hàng"
          value={stats.lowStockProducts}
          color="#ef6c00"
        />
        <StatCard
          label="Khách hàng mới"
          value={stats.newCustomers}
          color="#66bb6a"
        />
      </View>

      {/* BIỂU ĐỒ */}
      <View style={styles.box}>
        <Text style={styles.sectionTitle}>Doanh thu 7 ngày</Text>
        <View style={styles.chartRow}>
          {chartData.map((d) => (
            <View key={d.date} style={styles.chartColumn}>
              <View
                style={[
                  styles.chartBar,
                  { height: maxRevenue > 0 ? (d.revenue / maxRevenue) * 120 : 0 },
                ]}
              />
              <Text style={styles.chartLabel}>{d.date}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ĐƠN HÀNG MỚI NHẤT */}
      <View style={styles.box}>
        <Text style={styles.sectionTitle}>Đơn hàng mới nhất</Text>

        {recentOrders.map((o) => (
          <TouchableOpacity
            key={o.id}
            style={styles.orderCard}
            onPress={() =>
              navigation.navigate('AdminOrderDetail', { orderId: o.id })
            }
          >
            <View style={styles.orderRow}>
              <Text style={styles.orderCode}>{o.code}</Text>
              <StatusBadge status={o.status} styles={styles} />
            </View>

            <Text style={styles.orderText}>
              {o.customer} · {o.phone}
            </Text>
            <Text style={styles.orderText}>{o.createdAt}</Text>
            <Text style={styles.orderTotal}>
              {o.total.toLocaleString('vi-VN')} đ
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.secondary },

  /* --- Style mới cho Header --- */
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  menuIconBtn: {
    padding: 4,
  },
  hamburgerIcon: {
    fontSize: 28, // Kích thước icon 3 gạch
    color: '#333',
    fontWeight: 'bold',
  },
  menuDropdown: {
    marginTop: 0,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  /* ---------------------------- */

  row: { flexDirection: 'row', paddingHorizontal: 6 },
  box: {
    backgroundColor: 'white',
    marginHorizontal: 12,
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 8 },

  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  chartColumn: { alignItems: 'center', flex: 1 },
  chartBar: {
    width: 18,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  chartLabel: { fontSize: 11, marginTop: 4 },

  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: 4,
    marginHorizontal: -4,
  },
  quickItem: {
    width: '25%',
    paddingHorizontal: 4,
    marginBottom: 8
  },
  quickBtn: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    elevation: 2,
  },
  quickIcon: { fontSize: 24, marginBottom: 4 },
  quickText: { fontSize: 11, fontWeight: '600', color: '#333', textAlign: 'center' },

  orderCard: { marginTop: 8, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#eee' },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderCode: { fontWeight: '700', color: '#333' },
  orderText: { fontSize: 12, color: '#555', marginTop: 2 },
  orderTotal: { marginTop: 4, fontWeight: '700', color: colors.accent },

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