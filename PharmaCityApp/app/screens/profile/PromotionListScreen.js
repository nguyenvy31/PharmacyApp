import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import colors from '../../config/colors';
import api from '../../config/adminApi';
import { authFetch } from '../../utils/authFetch';

// Helper format currency VND
const formatCurrency = (value) => {
  if (!value && value !== 0) return '0₫';
  return value.toLocaleString('vi-VN') + '₫';
};

// Helper format date
const formatDate = (dateString) => {
  if (!dateString) return 'Không có';
  const date = new Date(dateString);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

// Helper check expired
const isExpired = (expireAt) => {
  if (!expireAt) return false;
  return new Date(expireAt) < new Date();
};

export default function PromotionListScreen({ navigation }) {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copyingId, setCopyingId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadPromotions();
    }, [])
  );

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const res = await authFetch(api.ADMIN_PROMOTIONS, {}, navigation);
      const data = await res.json();
      // Chỉ hiển thị khuyến mãi đang active
      const activePromotions = (data || []).filter(
        (promo) => promo.active === true
      );
      setPromotions(activePromotions);
    } catch (e) {
      if (e.message !== 'UNAUTHORIZED') {
        console.log(e);
        Alert.alert('Lỗi', 'Không thể tải danh sách khuyến mãi');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyPromoCode = async (code, id) => {
    try {
      setCopyingId(id);
      await Clipboard.setString(code);
      Alert.alert('🎉 Thành công', `Đã sao chép mã "${code}"`, [
        { text: 'OK', style: 'cancel' },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể sao chép mã, vui lòng thử lại');
    } finally {
      setCopyingId(null);
    }
  };

  const renderPromotionCard = ({ item }) => {
    const expired = isExpired(item.expireAt);
    const isPercent = item.type === 'PERCENT';

    const discountText = isPercent
      ? `Giảm ${item.value}%`
      : `Giảm ${formatCurrency(item.value)}`;

    const maxDiscountText =
      isPercent && item.maxDiscount
        ? ` (tối đa ${formatCurrency(item.maxDiscount)})`
        : '';

    const minOrderText =
      item.minOrderValue && item.minOrderValue > 0
        ? `Đơn tối thiểu ${formatCurrency(item.minOrderValue)}`
        : 'Không yêu cầu đơn tối thiểu';

    const usageText = item.quantity
      ? `Còn ${Math.max(0, item.quantity - (item.used || 0))}/${item.quantity} lượt`
      : 'Không giới hạn lượt';

    return (
      <View style={[styles.card, expired && styles.cardExpired]}>
        {/* Header với mã code */}
        <View style={styles.cardHeader}>
          <View style={styles.codeWrapper}>
            <Text style={styles.codeLabel}>MÃ KHUYẾN MÃI</Text>
            <Text style={styles.codeText}>{item.code}</Text>
          </View>
          {expired && (
            <View style={styles.expiredBadge}>
              <Text style={styles.expiredBadgeText}>HẾT HẠN</Text>
            </View>
          )}
        </View>

        {/* Nội dung giảm giá */}
        <View style={styles.discountSection}>
          <Text style={styles.discountText}>
            {discountText}
            {maxDiscountText}
          </Text>
        </View>

        {/* Thông tin chi tiết */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Đơn tối thiểu</Text>
            <Text style={styles.infoValue}>{minOrderText}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Lượt sử dụng</Text>
            <Text style={styles.infoValue}>{usageText}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Hạn sử dụng</Text>
            <Text
              style={[styles.infoValue, expired && styles.infoValueExpired]}>
              {formatDate(item.expireAt)}
            </Text>
          </View>
        </View>

        {/* Nút copy */}
        <TouchableOpacity
          style={[styles.copyButton, expired && styles.copyButtonDisabled]}
          onPress={() => !expired && copyPromoCode(item.code, item.id)}
          disabled={expired || copyingId === item.id}
          activeOpacity={0.8}>
          {copyingId === item.id ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Text style={styles.copyButtonText}>Sao chép mã</Text>
              <Text style={styles.copyIcon}>📋</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🎁</Text>
      <Text style={styles.emptyTitle}>Chưa có khuyến mãi</Text>
      <Text style={styles.emptyText}>
        Hiện tại chưa có chương trình khuyến mãi nào.{'\n'}
        Hãy quay lại sau nhé!
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary || '#1E3A5F'} />
        <Text style={styles.loadingText}>Đang tải khuyến mãi...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>✨ Ưu đãi đặc biệt</Text>
          <Text style={styles.headerSubtitle}>
            Những mã giảm giá hấp dẫn dành riêng cho bạn
          </Text>
        </View>

        {/* Danh sách khuyến mãi */}
        <FlatList
          data={promotions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPromotionCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF', // Xanh nhạt
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F9FF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#1E3A5F',
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A5F', // Xanh dương đậm
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6C86A3',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    padding: 18,
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E8F0FE',
  },
  cardExpired: {
    backgroundColor: '#F8FAFE',
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  codeWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  codeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1E3A5F',
    marginRight: 8,
    letterSpacing: 0.5,
  },
  codeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E3A5F',
    letterSpacing: 0.8,
  },
  expiredBadge: {
    backgroundColor: '#E53935',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  expiredBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  discountSection: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF3FC',
  },
  discountText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E53935',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 18,
    gap: 12,
  },
  infoItem: {
    flex: 1,
    minWidth: '30%',
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8E9AAB',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C3E50',
  },
  infoValueExpired: {
    color: '#E53935',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E3A5F', // Xanh dương chủ đạo
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  copyButtonDisabled: {
    backgroundColor: '#B0C4DE',
  },
  copyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  copyIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E3A5F',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#8E9AAB',
    textAlign: 'center',
    lineHeight: 20,
  },
});