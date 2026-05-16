import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import colors from '../../config/colors';
import adminApi from '../../config/adminApi';
import { authFetch } from '../../utils/authFetch';

// ===== CARD =====
const StatCard = ({ label, value, color }) => (
  <View style={[styles.card, { borderLeftColor: color || colors.primary }]}>
    <Text style={styles.cardLabel}>{label}</Text>
    <Text style={styles.cardValue}>{value}</Text>
  </View>
);

// ===== REVENUE HIGHLIGHT COMPONENT =====
const RevenueHighlight = ({ totalRevenue, monthlyRevenue, lastMonthRevenue, growthRate }) => {
  const currentMonth = new Date().toLocaleString('vi-VN', { month: 'long' });
  const isPositive = growthRate >= 0;

  return (
    <View>
      {/* 2 card chính */}
      <View style={styles.revenueHighlightContainer}>
        <View style={styles.revenueHighlightCard}>
          <Icon name="wallet" size={32} color="#ffc107" solid />
          <Text style={styles.revenueHighlightLabel}>TỔNG DOANH THU</Text>
          <Text style={styles.revenueHighlightValue}>{formatMoney(totalRevenue)}</Text>
          <Text style={styles.revenueHighlightPeriod}>Toàn thời gian</Text>
        </View>

        <View style={styles.revenueDivider} />

        <View style={styles.revenueHighlightCard}>
          <Icon name="calendar-alt" size={32} color="#4caf50" solid />
          <Text style={styles.revenueHighlightLabel}>DOANH THU THÁNG NÀY</Text>
          <Text style={styles.revenueHighlightValue}>{formatMoney(monthlyRevenue)}</Text>
          <Text style={styles.revenueHighlightPeriod}>{currentMonth}</Text>
        </View>
      </View>

      {/* Card so sánh tăng trưởng - THÊM MỚI */}
      <View style={styles.growthContainer}>
        <View style={styles.growthCard}>
          <Icon name="chart-line" size={24} color={isPositive ? '#4caf50' : '#f44336'} solid />
          <Text style={styles.growthLabel}>So với tháng trước</Text>
          <Text style={[styles.growthValue, { color: isPositive ? '#4caf50' : '#f44336' }]}>
            {isPositive ? '↑' : '↓'} {Math.abs(growthRate).toFixed(1)}%
          </Text>
          <Text style={styles.growthDetail}>
            {formatMoney(lastMonthRevenue)} → {formatMoney(monthlyRevenue)}
          </Text>
        </View>
      </View>
    </View>
  );
};

// ===== BAR CHART =====
const SimpleBarChart = ({ data, labels }) => {
  const max = Math.max(...data, 1);

  return (
    <View style={styles.chartCard}>
      <Text style={styles.sectionTitle}>📈 Doanh thu 7 ngày</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartContainer}>
          {data.map((v, i) => (
            <View key={i} style={styles.barWrapper}>
              <View style={styles.barColumn}>
                <View
                  style={[
                    styles.bar,
                    { height: Math.max(30, (v / max) * 120) },
                  ]}
                />
                <Text style={styles.barValue}>
                  {v >= 1_000_000
                    ? `${(v / 1_000_000).toFixed(1)}M`
                    : v >= 1_000
                    ? `${(v / 1_000).toFixed(0)}k`
                    : v}
                </Text>
              </View>
              <Text style={styles.barLabel}>
                {labels[i]?.substring(5)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default function RevenueStatsScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [dashboard, setDashboard] = useState({});
  const [revenue, setRevenue] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [revenueSummary, setRevenueSummary] = useState({});

  // ===== FETCH =====
  const fetchData = async () => {
    setLoading(true);
    try {
      // Dashboard
      const dashRes = await authFetch(adminApi.DASHBOARD, {}, navigation);
      const dashData = await dashRes.json();
      setDashboard(dashData);

      // Revenue 7 days
      const revRes = await authFetch(
        adminApi.DASHBOARD_REVENUE_7_DAYS,
        {},
        navigation
      );
      const revData = await revRes.json();
      setRevenue(revData);

      // Recent orders
      const orderRes = await authFetch(
        adminApi.DASHBOARD_RECENT_ORDERS,
        {},
        navigation
      );
      const orderData = await orderRes.json();
      setRecentOrders(orderData);

      // Revenue Summary (Tổng doanh thu & Doanh thu tháng)
      const summaryRes = await authFetch(
        adminApi.DASHBOARD_REVENUE_SUMMARY,
        {},
        navigation
      );
      const summaryData = await summaryRes.json();
      setRevenueSummary(summaryData);

    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatMoney = (v) =>
    (v || 0).toLocaleString('vi-VN') + ' đ';

  if (loading && !refreshing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>📊 Dashboard</Text>
      </View>

      {/* REVENUE HIGHLIGHT */}
      <RevenueHighlight
        totalRevenue={revenueSummary.totalRevenue}
        monthlyRevenue={revenueSummary.monthlyRevenue}
        lastMonthRevenue={revenueSummary.lastMonthRevenue}
        growthRate={revenueSummary.growthRate}
      />

      {/* KPI */}
      <View style={styles.kpiGrid}>
        <StatCard
          label="💰 Doanh thu hôm nay"
          value={formatMoney(dashboard.todayRevenue)}
        />
        <StatCard
          label="📦 Đơn hôm nay"
          value={dashboard.newOrders || 0}
          color="#27ae60"
        />
        <StatCard
          label="⚠️ Sắp hết hàng"
          value={dashboard.lowStockProducts || 0}
          color="#e67e22"
        />
        <StatCard
          label="👤 Khách mới"
          value={dashboard.newCustomers || 0}
          color="#8e44ad"
        />
      </View>

      {/* CHART */}
      {revenue.length > 0 && (
        <SimpleBarChart
          data={revenue.map(i => Number(i.revenue))}
          labels={revenue.map(i => i.date)}
        />
      )}

      {/* RECENT ORDERS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🕐 Đơn gần đây</Text>

        {recentOrders.map(o => (
          <TouchableOpacity
            key={o.id}
            style={styles.orderRow}
            onPress={() =>
              navigation.navigate('AdminOrderDetail', { orderId: o.id })
            }
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.code}>{o.code}</Text>
              <Text style={styles.customer}>{o.customer}</Text>
            </View>

            <View>
              <Text style={styles.total}>
                {formatMoney(o.total)}
              </Text>
              <Text style={styles.status}>{o.status}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ===== STYLE =====
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    backgroundColor: colors.primary,
    padding: 16,
  },

  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },

  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },

  card: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 6,
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
  },

  cardLabel: { fontSize: 12, color: '#777' },
  cardValue: { fontSize: 18, fontWeight: 'bold' },

  chartCard: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 12,
    borderRadius: 12,
  },

  section: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 12,
    borderRadius: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  barWrapper: { width: 50, alignItems: 'center' },
  barColumn: { alignItems: 'center' },

  bar: {
    width: 25,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },

  barValue: { fontSize: 10 },
  barLabel: { fontSize: 10 },

  orderRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  code: { fontWeight: '600' },
  customer: { fontSize: 12, color: '#555' },

  total: {
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'right',
  },

  status: {
    fontSize: 11,
    textAlign: 'right',
    color: '#888',
  },

  // Styles cho Revenue Highlight
  revenueHighlightContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  revenueHighlightCard: {
    flex: 1,
    alignItems: 'center',
  },
  revenueDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
  revenueHighlightLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  revenueHighlightValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginTop: 4,
  },
  revenueHighlightPeriod: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  growthContainer: {
      backgroundColor: '#fff',
      marginHorizontal: 12,
      marginBottom: 12,
      borderRadius: 12,
      padding: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    growthCard: {
      alignItems: 'center',
    },
    growthLabel: {
      fontSize: 13,
      color: '#666',
      marginTop: 8,
    },
    growthValue: {
      fontSize: 28,
      fontWeight: 'bold',
      marginTop: 4,
    },
    growthDetail: {
      fontSize: 12,
      color: '#999',
      marginTop: 4,
    },
});

function formatMoney(v) {
  return (v || 0).toLocaleString('vi-VN') + ' đ';
}