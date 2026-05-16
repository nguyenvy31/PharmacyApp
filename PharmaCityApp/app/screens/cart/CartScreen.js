// app/screens/cart/CartScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import colors from '../../config/colors';
import { useCart } from '../../context/CartContext';

function CartScreen({ navigation }) {
  const { items, updateQty, removeItem, subtotal } = useCart();

  // State để quản lý các sản phẩm được chọn
  const [selectedItems, setSelectedItems] = useState({});
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Khởi tạo selectedItems khi items thay đổi
  useEffect(() => {
    const initialSelected = {};
    items.forEach(item => {
      initialSelected[item.id] = true; // Mặc định chọn tất cả
    });
    setSelectedItems(initialSelected);
  }, [items]);

  // Tính toán lại tổng tiền dựa trên sản phẩm được chọn
  const calculateSelectedTotal = () => {
    let total = 0;
    items.forEach(item => {
      if (selectedItems[item.id]) {
        total += item.price * item.qty;
      }
    });
    return total;
  };

  // Lấy danh sách sản phẩm được chọn
  const getSelectedItems = () => {
    return items.filter(item => selectedItems[item.id]);
  };

  const selectedSubtotal = calculateSelectedTotal();
  const selectedCount = Object.values(selectedItems).filter(v => v === true).length;
  const shippingFee = selectedSubtotal >= 300000 ? 0 : 30000;
  const total = selectedSubtotal + shippingFee;

  // Kiểm tra xem tất cả sản phẩm đã được chọn chưa
  useEffect(() => {
    if (items.length === 0) {
      setIsAllSelected(false);
      return;
    }
    const allSelected = items.every(item => selectedItems[item.id]);
    setIsAllSelected(allSelected);
  }, [selectedItems, items]);

  // Chọn/bỏ chọn một sản phẩm
  const toggleSelectItem = (itemId) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Chọn/bỏ chọn tất cả sản phẩm
  const toggleSelectAll = () => {
    if (isAllSelected) {
      // Bỏ chọn tất cả
      const newSelected = {};
      items.forEach(item => {
        newSelected[item.id] = false;
      });
      setSelectedItems(newSelected);
    } else {
      // Chọn tất cả
      const newSelected = {};
      items.forEach(item => {
        newSelected[item.id] = true;
      });
      setSelectedItems(newSelected);
    }
  };

  // Xóa sản phẩm đã chọn
  const removeSelectedItems = () => {
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc muốn xóa ${selectedCount} sản phẩm đã chọn?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            const selectedIds = Object.keys(selectedItems).filter(id => selectedItems[id]);
            selectedIds.forEach(id => removeItem(parseInt(id)));
          }
        }
      ]
    );
  };

  // Thanh toán các sản phẩm đã chọn
  const handleCheckout = () => {
    if (selectedCount === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một sản phẩm để thanh toán');
      return;
    }

    const selectedProducts = getSelectedItems();
    navigation.navigate('Checkout', {
      selectedItems: selectedProducts,
      isBuyNow: false
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      {/* Checkbox chọn sản phẩm */}
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => toggleSelectItem(item.id)}
        activeOpacity={0.7}
      >
        <View style={[
          styles.checkboxInner,
          selectedItems[item.id] && styles.checkboxSelected
        ]}>
          {selectedItems[item.id] && (
            <Text style={styles.checkIcon}>✓</Text>
          )}
        </View>
      </TouchableOpacity>

      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      ) : (
        <View style={[styles.itemImage, styles.imagePlaceholder]}>
          <Text style={{ fontSize: 10, color: '#666' }}>No Image</Text>
        </View>
      )}

      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>
          {item.price.toLocaleString('vi-VN')} đ
        </Text>

        <View style={styles.qtyRow}>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => updateQty(item.id, item.qty - 1)}
          >
            <Text style={styles.qtyText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.qtyValue}>{item.qty}</Text>

          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => updateQty(item.id, item.qty + 1)}
          >
            <Text style={styles.qtyText}>+</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeItem(item.id)}
          >
            <Text style={styles.removeText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header với chọn tất cả và xóa sản phẩm đã chọn */}
      {items.length > 0 && (
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.selectAllButton}
            onPress={toggleSelectAll}
          >
            <View style={[
              styles.checkboxInner,
              isAllSelected && styles.checkboxSelected
            ]}>
              {isAllSelected && <Text style={styles.checkIcon}>✓</Text>}
            </View>
            <Text style={styles.selectAllText}>
              {isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </Text>
          </TouchableOpacity>

          {selectedCount > 0 && (
            <TouchableOpacity
              style={styles.removeSelectedButton}
              onPress={removeSelectedItems}
            >
              <Text style={styles.removeSelectedText}>Xóa ({selectedCount})</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(it) => it.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 140, paddingHorizontal: 10 }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 16, color: '#555' }}>
              Giỏ hàng của bạn đang trống.
            </Text>
          </View>
        }
      />

      {items.length > 0 && selectedCount > 0 && (
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Đã chọn</Text>
            <Text style={styles.summaryValue}>
              {selectedCount} sản phẩm
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính</Text>
            <Text style={styles.summaryValue}>
              {selectedSubtotal.toLocaleString('vi-VN')} đ
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
            <Text style={styles.summaryValue}>
              {shippingFee === 0
                ? 'Miễn phí (≥ 300.000 đ)'
                : `${shippingFee.toLocaleString('vi-VN')} đ`}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { fontWeight: '700' }]}>
              Tổng cộng
            </Text>
            <Text style={[styles.summaryValue, { color: '#3498db', fontSize: 18, fontWeight: 'bold' }]}>
              {total.toLocaleString('vi-VN')} đ
            </Text>
          </View>

          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={handleCheckout}
          >
            <Text style={styles.checkoutText}>Thanh toán ({selectedCount})</Text>
          </TouchableOpacity>
        </View>
      )}

      {items.length > 0 && selectedCount === 0 && (
        <View style={styles.summaryBox}>
          <Text style={{ textAlign: 'center', color: '#888', paddingVertical: 10 }}>
            Vui lòng chọn sản phẩm để thanh toán
          </Text>
        </View>
      )}
    </View>
  );
}

export default CartScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.secondary },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectAllText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  removeSelectedButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ff4444',
    borderRadius: 6,
  },
  removeSelectedText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
  },
  itemRow: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxInner: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  checkboxSelected: {
    backgroundColor: '#3498db',
  },
  checkIcon: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: { flex: 1, marginLeft: 10 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#333' },
  itemPrice: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3498db',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  qtyButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: { fontSize: 16 },
  qtyValue: { marginHorizontal: 10, fontSize: 15 },
  removeButton: { marginLeft: 16 },
  removeText: { color: '#d32f2f', fontSize: 13 },
  emptyBox: {
    marginTop: 40,
    alignItems: 'center',
  },
  summaryBox: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  summaryLabel: { fontSize: 14, color: '#444' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  checkoutButton: {
    marginTop: 12,
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  checkoutText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});