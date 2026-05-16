import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import colors from '../../config/colors';
import adminApi from '../../config/adminApi';
import { authFetch } from '../../utils/authFetch';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function InventoryScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');

  // Modal state
  const [visible, setVisible] = useState(false);
  const [qty, setQty] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  // Animation
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      fetchInventory();
    }, [])
  );

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await authFetch(
        adminApi.INVENTORY_LIST,
        {},
        navigation
      );

      const data = await res.json();
      setItems(data || []);

    } catch (e) {
      if (e.message !== 'UNAUTHORIZED') {
        console.log(e);
      }
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item) => {
    setSelectedItem(item);
    setQty('');
    setVisible(true);

    scaleAnim.setValue(0.8);
    opacityAnim.setValue(0);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  const handleRestock = async () => {
    const num = Number(qty);
    if (!num || num <= 0) return;

    try {
      await authFetch(
        `${adminApi.INVENTORY_RESTOCK(selectedItem.id)}?qty=${num}`,
        { method: 'PATCH' },
        navigation
      );

      fetchInventory();

    } catch (e) {
      console.log(e);
    } finally {
      closeModal();
    }
  };

  const filtered = items.filter((it) =>
    it?.name?.toLowerCase().includes(q.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.sub}>
          Đã bán hôm nay: {item.soldToday} · Tuần: {item.soldWeek}
        </Text>
      </View>

      <Text
        style={[
          styles.stock,
          item.stock < 10 && { color: '#ef6c00' },
        ]}
      >
        {item.stock}
      </Text>

      <TouchableOpacity
        style={styles.quickBtn}
        onPress={() => openModal(item)}
      >
        <Text style={{ color: colors.primary }}>Nhập Hàng</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.secondary }}>
      {/* Search */}
      <View style={styles.searchBox}>
        <TextInput
          placeholder="Tìm sản phẩm"
          value={q}
          onChangeText={setQ}
          style={styles.searchInput}
        />
      </View>

      {/* List */}
      {loading ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>
          Đang tải...
        </Text>
      ) : filtered.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>
          Không có dữ liệu
        </Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(it) => String(it.id)}
          renderItem={renderItem}
        />
      )}

      {/* Modal */}
      <Modal visible={visible} transparent animationType="none">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <Animated.View
            style={[
              styles.modalBox,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={styles.modalTitle}>Nhập hàng</Text>

            <Text style={styles.modalSubtitle}>
              {selectedItem?.name}
            </Text>

            <TextInput
              value={qty}
              onChangeText={setQty}
              keyboardType="number-pad"
              placeholder="Số lượng"
              style={styles.modalInput}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.cancel}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleRestock}>
                <Text style={styles.confirm}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  searchBox: {
    backgroundColor: 'white',
    padding: 12,
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 12,
    borderRadius: 10,
  },
  name: {
    fontWeight: '700',
  },
  sub: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  stock: {
    width: 60,
    textAlign: 'right',
    fontWeight: '700',
  },
  quickBtn: {
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '82%',
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#666',
    marginVertical: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cancel: {
    color: '#666',
    marginRight: 20,
  },
  confirm: {
    color: colors.primary,
    fontWeight: '700',
  },
});
