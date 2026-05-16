import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../../config/colors';
import api from '../../config/adminApi';
import { authFetch } from '../../utils/authFetch';

export default function ProductsScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL / IN_STOCK / OUT_OF_STOCK

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await authFetch(
        api.ADMIN_MEDICINES,
        {},
        navigation
      );

      const data = await res.json();
      setProducts(data || []);

    } catch (e) {
      if (e.message !== 'UNAUTHORIZED') {
        console.log('Error fetchProducts', e);
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const filtered = products.filter((p) => {
    if (statusFilter === 'IN_STOCK' && p.stock <= 0) return false;
    if (statusFilter === 'OUT_OF_STOCK' && p.stock > 0) return false;
    if (!query) return true;
    return p.name.toLowerCase().includes(query.toLowerCase());
  });

  const renderItem = ({ item }) => {
    const stockColor =
      item.stock === 0
        ? '#d32f2f'
        : item.stock <= 10
        ? '#f9a825'
        : '#2e7d32';

    const stockText =
      item.stock === 0 ? 'Hết hàng' : `Tồn kho: ${item.stock}`;

    return (
      <View style={styles.card}>
        <Image
          source={
            item.imageUrl
              ? { uri: item.imageUrl }
              : require('../../assets/banner-placeholder.png')
          }
          style={styles.thumb}
        />

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>

          <Text style={styles.meta}>
            Hãng: {item.brand || 'Không rõ'}
          </Text>

          <View style={{ flexDirection: 'row', marginTop: 6 }}>
            <Text style={styles.price}>
              {item.price?.toLocaleString('vi-VN')} đ
            </Text>
            <Text style={[styles.stock, { color: stockColor }]}>
              {`  •  ${stockText}`}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() =>
            navigation.navigate('AdminProductForm', { medicineId: item.id })
          }
        >
          <Text style={{ color: colors.primary }}>Sửa</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AdminProductForm')}
        >
          <Text style={styles.addText}>+ Thêm thuốc mới</Text>
        </TouchableOpacity>

        <View style={{ flex: 1, marginLeft: 8 }}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm theo tên thuốc"
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterBtn, statusFilter === 'ALL' && styles.filterActive]}
          onPress={() => setStatusFilter('ALL')}
        >
          <Text style={styles.filterText}>Tất cả</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, statusFilter === 'IN_STOCK' && styles.filterActive]}
          onPress={() => setStatusFilter('IN_STOCK')}
        >
          <Text style={styles.filterText}>Còn hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, statusFilter === 'OUT_OF_STOCK' && styles.filterActive]}
          onPress={() => setStatusFilter('OUT_OF_STOCK')}
        >
          <Text style={styles.filterText}>Hết hàng</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ padding: 20 }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(it) => String(it.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.secondary },
  toolbar: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  addBtn: { padding: 8 },
  addText: { color: colors.primary, fontWeight: '600' },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'white',
  },
  filterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    marginRight: 8,
  },
  filterActive: {
    backgroundColor: colors.primary,
  },
  filterText: { color: '#333' },
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 12,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  thumb: { width: 64, height: 64, borderRadius: 6, backgroundColor: '#eee' },
  name: { fontWeight: '700' },
  meta: { fontSize: 12, color: '#666', marginTop: 4 },
  price: { fontWeight: '700', color: colors.accent },
  stock: { fontSize: 12, marginLeft: 8 },
  iconBtn: {
    borderWidth: 1,
    borderColor: '#eee',
    padding: 6,
    borderRadius: 6,
  },
});
