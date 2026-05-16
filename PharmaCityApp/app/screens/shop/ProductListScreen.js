import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Modal } from 'react-native';
import colors from '../../config/colors';
import api from '../../config/api';
import MedicineCard from '../../components/MedicineCard';
import { useCart } from '../../context/CartContext';

const sortOptions = [
  { key: 'popular', label: 'Phổ biến' },
  { key: 'newest', label: 'Mới nhất' },
  { key: 'price_asc', label: 'Giá thấp → cao' },
  { key: 'price_desc', label: 'Giá cao → thấp' },
];

export default function ProductListScreen({ navigation, route }) {
  const { categoryId, categoryName } = route.params || {};
  const [products, setProducts] = useState([]);
  const [sort, setSort] = useState('popular');
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    navigation.setOptions({ title: categoryName || 'Sản phẩm' });
    fetchProducts();
  }, [categoryId, sort]);

  const fetchProducts = async () => {
    try {
      const url = `${api.MEDICINES}?categoryId=${categoryId || ''}&sort=${sort}`;
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data || []);
    } catch (e) {
      console.log(e);
    }
  };

  const renderItem = ({ item }) => (
    <MedicineCard
      item={item}
      onPress={() =>
        navigation.navigate('ProductDetail', {
          medicineId: item.id,
        })
      }
      onAddToCart={() => addToCart(item)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Bộ lọc</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setSortModalVisible(true)}
        >
          <Text style={styles.filterText}>
            Sắp xếp: {sortOptions.find((o) => o.key === sort)?.label}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 6, paddingTop: 10 }}
      />

      <Modal
        visible={sortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {sortOptions.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={styles.modalItem}
                onPress={() => {
                  setSort(opt.key);
                  setSortModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.modalText,
                    sort === opt.key && { color: colors.accent, fontWeight: '600' },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.secondary },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'white',
  },
  filterButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  filterText: { fontSize: 13 },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000055',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 10,
    paddingVertical: 10,
  },
  modalItem: { paddingVertical: 10, paddingHorizontal: 16 },
  modalText: { fontSize: 14 },
});
